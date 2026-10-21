# Copy Rite — Copywriting Example Library

## What it does

Copy Rite retrieves up to 1,000 marketing-copy examples from the public Hugging Face dataset `suehuynh/marketing-instruct-13k` on first use. It selects relevant examples for each draft, passes a small handful into the local Qwen model as craft references, and caches the retrieved records in the browser's IndexedDB. This is retrieval-augmented generation (RAG), not fine-tuning the model weights.

## Source and license

- Dataset: https://huggingface.co/datasets/suehuynh/marketing-instruct-13k
- Dataset viewer API: https://datasets-server.huggingface.co/rows?dataset=suehuynh%2Fmarketing-instruct-13k&config=default&split=train&offset=0&length=100
- Declared dataset license: Apache-2.0
- Language: English
- Published dataset size: approximately 13,000 marketing instruction examples
- Source fields used: `enhanced_prompt` / `enhanced_completion`, with `original_prompt` / `original_completion` as fallbacks.

The upstream dataset is a curated marketing instruction-tuning corpus; it should not be described as 1,000 independently scraped real-world ads. Copy Rite fetches up to 1,000 records from this openly licensed corpus. The records are not committed as a bundled local data file; they are downloaded on first use and cached locally in the browser.

## Runtime behaviour

1. On first enhancement, fetch dataset records in batches of 100 from Hugging Face's dataset viewer.
2. Keep usable, unique prompt/completion pairs, up to 1,000.
3. Cache them in IndexedDB for later visits.
4. Rank examples using keyword overlap with the user's draft and creative direction.
5. Include up to three short examples in the prompt as craft references.
6. Tell the model not to copy source phrases, brand names, or claims.

The language model itself runs in the browser through Transformers.js. The dataset fetch requires an internet connection the first time. This does not call a hosted inference API and does not fine-tune model weights.

## Limitations / follow-up

- Browser inference and dataset retrieval must be tested in a real browser; a successful Vercel deployment alone does not prove either will work.
- Dataset viewer availability, CORS, schema, and row caps can change upstream.
- Keyword overlap is a lightweight retrieval baseline, not semantic embeddings.
- If actual model training is desired later, prepare a training split and run a separate fine-tuning pipeline; browser-side retrieval is not training.
