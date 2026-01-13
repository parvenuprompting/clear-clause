"""
ClearClause Dark Patterns Lexicon
Referentiekader voor juridische en ethische risico-detectie
"""

DARK_PATTERN_LEXICON = {
    "impliciete_toestemming": "Gebruik van de dienst geldt als akkoord zonder actieve handeling. Risico: Schending AVG transparantie.",
    "forced_continuity": "Automatische omzetting van gratis naar betaald zonder waarschuwing of eenvoudige opzegging.",
    "confirmshaming": "Manipulatieve taal bij het weigeren van opties (bijv. 'Nee, ik hou niet van privacy').",
    "verborgen_derden": "Vage omschrijvingen van datadelen met 'partners' zonder specificatie.",
    "gedwongen_arbitrage": "Uitsluiting van de gang naar de gewone rechter ten gunste van private arbitrage.",
    "trick_wording": "Dubbele ontkenningen of misleidende zinsstructuren.",
    "bait_and_switch": "De gebruiker adverteren met een bepaalde actie, maar een andere, vaak ongunstigere actie uitvoeren.",
    "hidden_costs": "Extra kosten die pas in de allerlaatste stap van het afrekenproces worden onthuld.",
    "roach_motel": "Een situatie waarin het heel makkelijk is om ergens lid van te worden, maar extreem moeilijk om het op te zeggen.",
    "privacy_zuckering": "De gebruiker verleiden om meer persoonlijke informatie te delen dan ze oorspronkelijk van plan waren door middel van verwarrende instellingen.",
    "sneak_into_basket": "Automatisch extra producten of diensten aan het winkelmandje toevoegen zonder expliciete toestemming."
}

# Legacy support (backwards compatibility)
dark_patterns_lexicon = DARK_PATTERN_LEXICON
