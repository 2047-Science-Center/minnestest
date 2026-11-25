# Station 2 på en NUC: bänktest

**Vad som testas:** båda stationerna på **en** NUC med två skärmar.
- **Vänster skärm:** Människa eller maskin. Två spelare, lur 1 och lur 2.
- **Höger skärm:** Lögndetektorn, lur B.

Varje fönster ska **bara höra sina egna lurar**, och allt ljud ska komma **i telefonlurarna** och inte i skärmarna.

**Lurarna:**

| Märkt lur | Sitter i | Blir | Hör till |
|---|---|---|---|
| Lur 1 | **framsidans uttag på NUC:en**, inte i hubben | XY-lur-B | Lögndetektorn |
| Lur 2 | hubbens uttag 2 | XY-lur-A1 | Människa eller maskin, spelare 1 |
| Lur 3 | hubbens uttag 4 | XY-lur-A2 | Människa eller maskin, spelare 2 |

Datorn känner igen luren på **uttaget** och inte på själva luren, eftersom donglarna är identiska. Flyttar någon en
kontakt till ett annat uttag följer rollen med uttaget. Uttagen är märkta med samma nummer som lurarna.
Hubben klarar bara två lurar. Med en tredje tar USB-bandbredden slut, och då försvinner en lur.

> **Rör inte kablarna** medan NUC:en är på. En dongel med glapp kan frysa all USB, och då måste NUC:en stängas av
> med strömknappen.

## Innan
1. Koppla NUC:en till nätet, till exempel 5G-pucken. **Internet krävs** för talfångsten och AI:n. Ingen broker
   behövs.
2. Stäng andra stationer som startat på skärmarna (Alt+F4).

## Starta
Testet startar av sig självt när NUC:en startar. Har du stängt det: dubbelklicka på **Station 2 test** på skrivbordet.
Saknas en lur startar det inte, och terminalen säger vilken lur det gäller. Stäng då av NUC:en, kontrollera kontakten
och starta igen. Det går också att köra i en terminal:
```bash
bash ~/minnestest/deploy/nuc/st2-test.sh
```
Efter cirka 15 sekunder visar vänster skärm "MÄNNISKA ELLER MASKIN" och höger skärm Lögndetektorn.

## Testa (bocka av)
**Människa eller maskin** (vänster skärm):
- [ ] Valet **SPELARE 1 / 2** syns, och 2 är förvalt. Tryck **STARTA**.
- [ ] VALdis röst och filmljudet hörs **i lur 1 och lur 2**, inte i skärmarna.
- [ ] Introt säger bara "Ställ er vid varsin lur.", utan "ett, två, tre".
- [ ] När **lur 1** har tur: prata i lur 1. Texten skrivs på pappret.
- [ ] När lur 1 har tur: prata **högt i lur 2**. **Inget** ska skrivas.
- [ ] Samma sak åt andra hållet när lur 2 har tur.
- [ ] Prata i **lur B** under en tur. **Inget** ska skrivas.

**Lögndetektorn** (höger skärm):
- [ ] Ljudet och frågorna hörs **i lur B**, inte i skärmarna.
- [ ] Svara i lur B. Svaret skrivs.
- [ ] Prata i lur 1 eller lur 2 medan någon svarar i B. **Inget** ska skrivas.

**Båda samtidigt:**
- [ ] Kör båda fönstren samtidigt och prata i alla tre lurarna. A ska bara skriva från den aktiva A-luren och B
      bara från lur B.

## Stäng
Stäng varje fönster med Alt+F4. Kör sedan:
```bash
bash ~/minnestest/deploy/nuc/st2-test.sh stopp
```

## Skicka tillbaka
- Ja eller nej på varje rad ovan.
- Vad som skrevs när det inte borde, ungefär vilka ord.
- Om något låter fel: i vilken lur och från vilket fönster.

## Om det krånglar
- **Inget skrivs alls:** kontrollera internet. Kör `bash ~/minnestest/deploy/nuc/st2-test.sh` igen, eftersom
  den kopplar om lurarna.
- **Ljudet kommer i skärmarna:** kör `bash ~/minnestest/deploy/nuc/st2-ljud.sh status`. Där ska `xy_lurar_A` och
  `xy_lur_B_ut` finnas. Starta sedan om med `st2-test.sh`.
- **Ett fönster blev vitt:** kör `st2-test.sh` igen.
- Loggar: `/tmp/st2-kiosk.log`, `/tmp/st2-mem.log`, `/tmp/st2-logn.log`.
