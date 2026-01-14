# MAINTENANCE & TRIAGE OPS

## 1. Issue Deduplicatie

Voor het maken van nieuwe issues of taken:

1. Check `gh issue list` op gesloten/open duplicaten.
2. Gebruik `gh search` met diverse keywords.
3. Als duplicaat gevonden: Voeg comment toe en sluit de nieuwe aanvraag.

## 2. Oncall Triage Criteria

Label een issue als `oncall` (P0) indien:

- De applicatie crasht of niet start.
- De UI bevriest/hangt ("Frozen").
- Core functionaliteit volledig geblokkeerd is.
- Er sprake is van dataverlies.
