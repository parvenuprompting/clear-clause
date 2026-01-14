# GIT PROTOCOL & SOP

Dit protocol vervangt losse scripts. Volg deze stappen voor elke wijziging:

1. **Branch Check**:

   - Werk NOOIT direct op `main`.
   - Check huidige branch: `git branch --show-current`.
   - Maak nieuw indien nodig: `git checkout -b feature/<naam>`.

2. **Commit**:

   - Taal: SIMPEL NEDERLANDS.
   - Format: `type: wat er is gedaan`.
   - Commando: `git add . && git commit -m "..."`

3. **Push & PR**:
   - Push naar origin.
   - Gebruik GH CLI voor PR: `gh pr create --title "..." --body "..."`
