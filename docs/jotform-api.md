# JotForm Submission API

This document summarises the JotForm REST endpoints used by the app when synchronising survey responses.

## Key Terminology

For clarity when debugging and maintaining the codebase:

- **JotForm Submission ID** (`jotformsubmissionid`): Internal reference to JotForm submission records
- **JotForm Question ID** (`jotformqid`): Internal reference to JotForm form field identifiers
- **API Communication**: When actually communicating with JotForm API, original field names (`qid`, `submissionId`) are used

## Authentication

All requests require an **API key** which can be supplied as:

- `apiKey` query parameter, or
- `APIKEY` HTTP header

The examples below use the query parameter form.

## Retrieve submissions

`GET /form/{formId}/submissions`

Fetches submission objects for a form. Each response includes an `answers` object keyed by numeric question IDs (`qid`).

**Parameters**

- `formId` – numeric form identifier
- `apiKey` – JotForm API key
- `offset` – (optional) starting index for pagination
- `limit` – (optional) number of records per page (default 20, max 1000)
- `filter` – (optional) JSON filter, e.g. `{"sessionkey":"abc123"}`

Use repeated requests with incrementing `offset` to page through records when more than 1000 submissions exist.

## Create a submission

`POST /form/{formId}/submissions`

Creates a single submission.

Body fields must be named using numeric `qid` values taken from `GET /form/{id}/questions`.
Composite fields append a suffix such as `_first`, `_last`, etc.

**Parameters**

- `formId`
- `apiKey`
- `submission[qid] = value`
- `submission[qid_subfield] = value` for composite fields

## Bulk create submissions

`PUT /form/{formId}/submissions`

Creates multiple submissions in one request. The body is a JSON array where each element maps `qid` to an object containing a `text` property.

```
[
  {"1": {"text": "answer"}, "2": {"text": "another"}},
  {"1": {"text": "foo"}, "2": {"text": "bar"}}
]
```

**Parameters**

- `formId`
- `apiKey`
- `submission` – JSON array as above

## Update a submission

`POST /submission/{submissionId}`

Edits an existing submission. Only specified fields are changed.

**Parameters**

- `submissionId` – ID returned by creation or listing
- `apiKey`
- `submission[qid] = value` (or `submission[qid_subfield] = value`)
- Optional flags: `submission[new]`, `submission[flag]`

## Delete a submission

`DELETE /submission/{submissionId}`

Removes a single submission.

**Parameters**

- `submissionId`
- `apiKey`

## Key identifiers

- **Form ID**: numeric value from the form URL (`https://www.jotform.com/form/<formId>`)
- **Question ID (qid)**: numeric key for each form field, retrieved via `GET /form/{formId}/questions`
  - Internally referenced as `jotformqid` for debugging clarity
- **Submission ID**: unique per response, returned in API responses and listing endpoints
  - Internally referenced as `jotformsubmissionid` for debugging clarity
- **API Communication**: When making actual API calls, use the original JotForm field names (`qid`, `submissionId`)

Keep all identifiers as strings when constructing request bodies to preserve leading zeroes.

## Upsert and logging workflow

The PDF parser uses an **upsert** strategy implemented in
`pdf_parser_gui/upload.py`:

1. Each record includes a pre-generated `sessionkey` field.
2. Existing submissions are looked up via
   `GET /form/{formId}/submissions?filter={"sessionkey":"<key>"}`.
3. If a matching `jotformsubmissionid` exists, the record is updated via
   `POST /submission/{submissionId}`. Otherwise, a new submission is created
   with `POST /form/{formId}/submissions`.
4. Upload metadata can be logged externally (optional) to Supabase (`supabaseUploadLogTable`) and/or a
   dedicated Jotform form (`jotformUploadLogFormId`). This is controlled by credentials
   feature flags (see `uploadLogging`). No local `upload_record.json` is created.

### Session key format

Clients are responsible for generating the `sessionkey` field before invoking
the upload helpers. The expected format is `studentid_yyyymmdd_hh_mm`, where the
date component usually comes from a `startDate` value. The helpers simply read
this field from CSV or JSON input and do not generate new keys.

### Field mapping

Client uploads look up numeric question IDs using `assets/jotformquestions.json`.
The helper `_load_jotform_mapping()` reads this file and returns a
`{field_name: qid}` dictionary. `upload_to_jotform` uses the mapping so each
response key is translated to its numeric `qid` when constructing the
`submission[qid]` payload required by the JotForm API. Upload log metadata reuses
the same helper with `assets/jotformuploadlogref.json` so log submissions also
reference the correct question IDs.

#### Local mapping asset and maintenance refresh

The web uploader supports two mapping shapes for `assets/jotformquestions.json`:

- Native Jotform export with a `content` object (recommended for the web GUI)
- Simplified `{ name: qid }` (often produced by Python utilities)

If the asset is missing, invalid, or lacks critical fields (for example, `sessionkey`),
the uploader falls back to `GET /form/{formId}/questions` using stored credentials.
It builds the mapping on the fly and proceeds with the upload.

The Maintenance modal (Debug Mode) adds a Jotform action:

- "更新題庫至本地記錄" downloads the latest questions JSON. Place the file at
  `assets/jotformquestions.json` for offline use. This preserves the full `content` shape.

Note about Python helper:

- `refresh_jotform_questions()` writes the simplified `{ name: qid }` mapping.
- This is fine for desktop parser flows. The web GUI prefers the native `content` structure
  but accepts both formats.

To verify the pipeline, confirm the returned submission IDs and use external logs
if enabled. If the Jotform request fails, refer to this document's endpoints to debug.

### Manual submission demo

A standalone script at `tests/test_jotform_api_demo.py` demonstrates posting
a real submission using numeric question IDs loaded from
`assets/jotformquestions.json`. The script reads credentials from
`assets/credentials.enc` (you will be prompted for the system password) and
expects the test data to already include a pre-generated `sessionkey` field.
Run:

```
python tests/test_jotform_api_demo.py
```

The script prints the constructed payload and basic response data so you
can confirm that field names are correctly translated to JotForm `qid`
values.
