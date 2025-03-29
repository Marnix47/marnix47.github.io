var nieuw_cijfer = 7.2;
var tot_weging = 7;
var nieuwe_weging = 2;
var oud_totaal = 9.5 + 8.3*2 + 8*2 + 8.8*2;
for(; nieuw_cijfer < 10; nieuw_cijfer += 0.1){
    console.log(Math.round(nieuw_cijfer * 10) / 10, nieuw_gemiddelde(nieuw_cijfer));
}

function nieuw_gemiddelde(nieuw_cijfer){
    return (oud_totaal + nieuw_cijfer * nieuwe_weging) / (tot_weging + nieuwe_weging);
}