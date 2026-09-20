export const BOOK_NAMES = [
  "Gênesis","Êxodo","Levítico","Números","Deuteronômio","Josué","Juízes","Rute","1 Samuel","2 Samuel",
  "1 Reis","2 Reis","1 Crônicas","2 Crônicas","Esdras","Neemias","Ester","Jó","Salmos","Provérbios",
  "Eclesiastes","Cânticos","Isaías","Jeremias","Lamentações","Ezequiel","Daniel","Oseias","Joel","Amós",
  "Obadias","Jonas","Miqueias","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias","Mateus",
  "Marcos","Lucas","João","Atos","Romanos","1 Coríntios","2 Coríntios","Gálatas","Efésios","Filipenses",
  "Colossenses","1 Tessalonicenses","2 Tessalonicenses","1 Timóteo","2 Timóteo","Tito","Filemom","Hebreus",
  "Tiago","1 Pedro","2 Pedro","1 João","2 João","3 João","Judas","Apocalipse",
] as const;

const BOOK_INFO_ROWS = `
Moisés|c. 1446–1406 a.C.|Israel|As origens, a criação, a queda, o dilúvio, os patriarcas e as promessas da aliança.|Gn 1:1; 3:15; 12:1-3; 50:20
Moisés|c. 1446–1406 a.C.|Israel|A libertação do Egito, a aliança no Sinai e a presença de Deus no tabernáculo.|Êx 3:14; 12:13; 20:1-17
Moisés|c. 1446–1406 a.C.|Israel|Santidade, sacrifícios, sacerdócio e comunhão do povo da aliança com Deus.|Lv 17:11; 19:2; 19:18
Moisés|c. 1446–1406 a.C.|Israel|A peregrinação no deserto, a incredulidade do povo e a fidelidade de Deus.|Nm 6:24-26; 14:18; 23:19
Moisés|c. 1406 a.C.|Nova geração de Israel|Renovação da aliança e preparação para entrar na terra prometida.|Dt 6:4-9; 8:2-3; 30:19-20
Josué, segundo tradição judaica|c. 1400 a.C.|Israel|A entrada em Canaã, as batalhas, a divisão da terra e o chamado à fidelidade.|Js 1:8-9; 24:15
Autor não identificado, tradição associa a Samuel|c. 1050–1000 a.C.|Israel|Ciclos de pecado, opressão, clamor e libertação no período dos juízes.|Jz 2:16-19; 21:25
Autor não identificado, tradição associa a Samuel|c. século XI a.C.|Israel|Fidelidade, redenção familiar e a linhagem que conduz ao rei Davi.|Rt 1:16; 2:12; 4:13-17
Autor não identificado; material ligado a Samuel, Natã e Gade|c. 930 a.C.|Israel|Samuel, o reinado de Saul e a ascensão de Davi como rei.|1Sm 8:7; 16:7; 17:45
Autor não identificado|c. 930 a.C.|Israel|O reinado de Davi, a aliança davídica, suas vitórias, pecados e consequências.|2Sm 7:12-16; 11:1-27; 22:2-4
Autor não identificado, tradição associa a Jeremias|c. 560–540 a.C.|Exilados de Judá|De Salomão à divisão do reino, mostrando fidelidade e apostasia.|1Rs 3:9; 8:27; 18:21
Autor não identificado, tradição associa a Jeremias|c. 560–540 a.C.|Exilados de Judá|A queda de Israel e Judá, o ministério profético e o exílio.|2Rs 5:15; 17:13-14; 25:1-30
Autor não identificado, chamado Cronista|c. 450–400 a.C.|Comunidade pós-exílica|Genealogias e o reinado de Davi com ênfase no templo e na adoração.|1Cr 16:8-11; 29:11
Autor não identificado, chamado Cronista|c. 450–400 a.C.|Comunidade pós-exílica|A história de Salomão e dos reis de Judá sob a perspectiva da aliança.|2Cr 7:14; 20:12
Esdras, segundo tradição|c. 440 a.C.|Judeus retornados do exílio|O retorno a Jerusalém e a reconstrução do templo e da vida pactual.|Ed 1:1-3; 7:10
Neemias, com possível edição posterior|c. 430 a.C.|Judeus em Jerusalém|Reconstrução dos muros, reforma comunitária, oração e liderança fiel.|Ne 1:4-11; 8:10
Autor não identificado|c. 460–330 a.C.|Judeus na Pérsia|A providência de Deus preservando seu povo por meio de Ester e Mardoqueu.|Et 4:14; 8:17
Autor não identificado|Data debatida|Povo de Deus em sofrimento|O sofrimento do justo, a soberania divina e os limites da sabedoria humana.|Jó 1:21; 19:25; 42:5-6
Diversos autores, principalmente Davi|c. 1000–400 a.C.|Comunidade adoradora de Israel|Orações e cânticos de adoração, lamento, confiança, arrependimento e esperança.|Sl 1; 23; 51; 119
Salomão e outros sábios|c. 970–700 a.C.|Israel e todos os que buscam sabedoria|Sabedoria prática fundada no temor do Senhor.|Pv 1:7; 3:5-6; 9:10
Qohelet, tradicionalmente associado a Salomão|c. 935 a.C. ou período posterior|Povo de Deus|A brevidade da vida, a vaidade de viver sem Deus e o temor do Senhor.|Ec 3:1; 12:13-14
Salomão|c. século X a.C.|Israel|Poemas sobre amor conjugal, desejo, compromisso e beleza no casamento.|Ct 2:16; 8:6-7
Isaías|c. 740–680 a.C.|Judá e Jerusalém|Juízo, santidade de Deus, esperança messiânica e consolação futura.|Is 6:1-8; 9:6; 53; 55:6-7
Jeremias|c. 627–580 a.C.|Judá antes e durante o exílio|Chamado ao arrependimento, juízo sobre Judá e promessa da nova aliança.|Jr 1:5; 17:9; 31:31-34
Jeremias, segundo tradição|Após 586 a.C.|Sobreviventes da queda de Jerusalém|Lamentos pela destruição de Jerusalém e esperança na misericórdia de Deus.|Lm 3:22-23; 3:40
Ezequiel|c. 593–571 a.C.|Exilados na Babilônia|A glória de Deus, responsabilidade, juízo, restauração e novo coração.|Ez 18:20; 36:26-27; 37
Daniel|c. 605–530 a.C.|Judeus no exílio|Fidelidade em terra estrangeira e visões sobre reinos e o governo de Deus.|Dn 3:17-18; 6:10; 7:13-14
Oseias|c. 755–715 a.C.|Reino do Norte|O amor fiel de Deus diante da infidelidade espiritual de Israel.|Os 6:6; 11:1; 14:4
Joel|Data debatida|Judá|O dia do Senhor, chamado ao arrependimento e promessa do Espírito.|Jl 2:12-13; 2:28-32
Amós|c. 760 a.C.|Reino do Norte|Justiça divina contra opressão, religiosidade vazia e pecado persistente.|Am 3:7; 5:21-24
Obadias|c. 586 a.C., possivelmente|Edom e Judá|Juízo contra o orgulho de Edom e esperança do reino do Senhor.|Ob 1:3-4; 1:15; 1:21
Jonas|Autor não identificado|Israel|A misericórdia de Deus para com as nações e a resistência do mensageiro.|Jn 2:9; 3:10; 4:2
Miqueias|c. 735–700 a.C.|Judá e Israel|Juízo, justiça, esperança messiânica e o caminho de uma vida fiel.|Mq 5:2; 6:8; 7:18-19
Naum|c. 663–612 a.C.|Judá e Nínive|A queda de Nínive e a justiça soberana de Deus sobre a violência.|Na 1:7; 1:15
Habacuque|c. 609–598 a.C.|Judá|Diálogo sobre o mal, a justiça divina e a vida pela fé.|Hc 2:4; 3:17-19
Sofonias|c. 640–609 a.C.|Judá|O dia do Senhor, juízo, purificação e alegria da restauração.|Sf 2:3; 3:17
Ageu|520 a.C.|Comunidade pós-exílica|Chamado para reconstruir o templo e colocar a obra de Deus em primeiro lugar.|Ag 1:5-8; 2:9
Zacarias|c. 520–480 a.C.|Comunidade pós-exílica|Visões de restauração, santidade e esperança messiânica.|Zc 4:6; 9:9; 12:10
Malaquias|c. 450–430 a.C.|Judá pós-exílico|Confronto à adoração negligente e anúncio do mensageiro vindouro.|Ml 1:6; 3:1; 4:2
Mateus|c. 60–80 d.C.|Cristãos, com forte contexto judaico|Jesus como Messias e Rei prometido, seus ensinos, morte e ressurreição.|Mt 5–7; 16:16; 28:18-20
Marcos|c. 55–70 d.C.|Cristãos do mundo romano|Jesus como Filho de Deus e Servo que entrega a vida em resgate.|Mc 1:1; 8:34; 10:45
Lucas|c. 60–80 d.C.|Teófilo e leitores gentios|Relato ordenado sobre Jesus, Salvador compassivo para todos os povos.|Lc 1:1-4; 4:18-19; 19:10
João|c. 80–95 d.C.|Igreja e leitores em geral|Sinais e discursos para que o leitor creia que Jesus é o Cristo e tenha vida.|Jo 1:1-14; 3:16; 14:6; 20:31
Lucas|c. 62–80 d.C.|Teófilo e a Igreja|A expansão do Evangelho pelo poder do Espírito, de Jerusalém às nações.|At 1:8; 2:38; 4:12
Paulo|c. 57 d.C.|Cristãos em Roma|Exposição do Evangelho: pecado, justificação, nova vida e misericórdia de Deus.|Rm 1:16-17; 3:23-24; 8:1; 10:9
Paulo|c. 53–55 d.C.|Igreja em Corinto|Correção de divisões e pecados, vida da igreja, dons e ressurreição.|1Co 1:18; 6:19-20; 13; 15
Paulo|c. 55–56 d.C.|Igreja em Corinto|Defesa do ministério apostólico, fraqueza, consolação e reconciliação.|2Co 4:7; 5:17-21; 12:9
Paulo|c. 48–55 d.C.|Igrejas da Galácia|Justificação pela fé, liberdade cristã e vida pelo Espírito.|Gl 2:20; 3:11; 5:22-23
Paulo|c. 60–62 d.C.|Cristãos da Ásia Menor|A graça de Deus, a unidade da Igreja em Cristo e a nova vida.|Ef 1:3-14; 2:8-10; 6:10-18
Paulo|c. 60–62 d.C.|Igreja em Filipos|Alegria em Cristo, humildade, perseverança e contentamento.|Fp 1:21; 2:5-11; 4:4-7
Paulo|c. 60–62 d.C.|Igreja em Colossos|A supremacia e suficiência de Cristo e a vida nele.|Cl 1:15-20; 2:8-10; 3:1-4
Paulo|c. 50–51 d.C.|Igreja em Tessalônica|Fé, santidade, esperança e a volta de Cristo.|1Ts 4:3; 4:13-18; 5:16-18
Paulo|c. 50–52 d.C.|Igreja em Tessalônica|Perseverança, correção sobre o dia do Senhor e trabalho responsável.|2Ts 1:6-10; 2:1-4; 3:10
Paulo|c. 62–65 d.C.|Timóteo em Éfeso|Ordem na igreja, doutrina sadia e qualificação de líderes.|1Tm 1:15; 3:1-13; 4:12
Paulo|c. 66–67 d.C.|Timóteo|Fidelidade final, perseverança no ministério e autoridade das Escrituras.|2Tm 1:7; 2:15; 3:16-17; 4:7
Paulo|c. 63–65 d.C.|Tito em Creta|Doutrina sadia, liderança e boas obras como fruto da graça.|Tt 2:11-14; 3:4-7
Paulo|c. 60–62 d.C.|Filemom e a igreja em sua casa|Reconciliação cristã e recepção de Onésimo como irmão.|Fm 1:6; 1:16-17
Autor não identificado|c. 60–90 d.C.|Cristãos sob pressão|A supremacia de Cristo, a nova aliança e perseverança na fé.|Hb 1:1-3; 4:14-16; 11; 12:1-2
Tiago, irmão do Senhor|c. 40–60 d.C.|Cristãos judeus dispersos|Fé viva demonstrada em obras, sabedoria, domínio da língua e oração.|Tg 1:2-5; 1:22; 2:17
Pedro|c. 62–64 d.C.|Cristãos dispersos na Ásia Menor|Esperança e santidade em meio ao sofrimento por causa de Cristo.|1Pe 1:3-9; 2:9; 5:7
Pedro|c. 64–68 d.C.|Cristãos em geral|Crescimento espiritual, verdade apostólica e alerta contra falsos mestres.|2Pe 1:3-8; 1:20-21; 3:9
João|c. 85–95 d.C.|Igrejas ligadas ao ministério de João|Certeza da vida eterna, verdade sobre Cristo e amor fraternal.|1Jo 1:9; 4:8-10; 5:11-13
João|c. 85–95 d.C.|Senhora eleita e seus filhos, possivelmente uma igreja|Verdade, amor e vigilância contra enganadores.|2Jo 1:6-9
João|c. 85–95 d.C.|Gaio|Hospitalidade fiel, testemunho e confronto à liderança orgulhosa.|3Jo 1:4; 1:11
Judas, irmão de Tiago|c. 60–80 d.C.|Cristãos em geral|Defesa da fé apostólica diante de falsos mestres.|Jd 1:3; 1:20-25
João|c. 90–96 d.C.|Sete igrejas da Ásia e toda a Igreja|A vitória do Cordeiro, perseverança, juízo e nova criação.|Ap 1:8; 5:9-10; 21:1-5; 22:20
`.trim().split("\n");

export const BOOK_INFO = BOOK_NAMES.map((name, index) => {
  const [author, date, audience, summary, famous] = BOOK_INFO_ROWS[index].split("|");
  return { name, author, date, audience, summary, famous: famous.split("; ") };
});

export type ScriptureRef = { book: number; chapter: number; verse: number; label: string };

const ref = (book: number, chapter: number, verse: number, label: string): ScriptureRef => ({ book, chapter, verse, label });

export const TOPICS = [
  { name: "Graça", description: "O favor livre de Deus, não comprado por mérito humano.", refs: [ref(42,1,16,"João 1:16"),ref(44,3,24,"Romanos 3:24"),ref(48,2,8,"Efésios 2:8"),ref(55,2,11,"Tito 2:11")] },
  { name: "Salvação", description: "A obra de Deus que resgata o pecador por meio de Jesus Cristo.", refs: [ref(39,1,21,"Mateus 1:21"),ref(42,3,16,"João 3:16"),ref(43,4,12,"Atos 4:12"),ref(44,10,9,"Romanos 10:9")] },
  { name: "Arrependimento", description: "Voltar-se do pecado para Deus com fé e mudança de direção.", refs: [ref(40,1,15,"Marcos 1:15"),ref(43,2,38,"Atos 2:38"),ref(43,17,30,"Atos 17:30"),ref(46,7,10,"2 Coríntios 7:10")] },
  { name: "Fé", description: "Confiança em Deus e em sua promessa cumprida em Cristo.", refs: [ref(42,3,16,"João 3:16"),ref(44,1,17,"Romanos 1:17"),ref(57,11,1,"Hebreus 11:1"),ref(58,2,17,"Tiago 2:17")] },
  { name: "Jesus Cristo", description: "O Filho de Deus, Senhor, Salvador, morto e ressuscitado.", refs: [ref(42,1,1,"João 1:1"),ref(42,14,6,"João 14:6"),ref(49,2,9,"Filipenses 2:9"),ref(50,1,15,"Colossenses 1:15")] },
  { name: "Pecado", description: "Rebelião contra Deus que alcança toda a humanidade.", refs: [ref(0,3,6,"Gênesis 3:6"),ref(22,59,2,"Isaías 59:2"),ref(44,3,23,"Romanos 3:23"),ref(61,1,9,"1 João 1:9")] },
  { name: "Perdão", description: "A remoção da culpa concedida por Deus em Cristo.", refs: [ref(18,51,1,"Salmos 51:1"),ref(48,1,7,"Efésios 1:7"),ref(50,3,13,"Colossenses 3:13"),ref(61,1,9,"1 João 1:9")] },
  { name: "Oração", description: "Comunhão reverente, confiante e perseverante com Deus.", refs: [ref(39,6,9,"Mateus 6:9"),ref(49,4,6,"Filipenses 4:6"),ref(51,5,17,"1 Tessalonicenses 5:17"),ref(58,5,16,"Tiago 5:16")] },
  { name: "Espírito Santo", description: "Pessoa divina que convence, regenera, habita e santifica.", refs: [ref(42,14,26,"João 14:26"),ref(43,1,8,"Atos 1:8"),ref(47,5,22,"Gálatas 5:22"),ref(48,1,13,"Efésios 1:13")] },
  { name: "Batismo", description: "Ordenança ligada à confissão pública de fé e ao discipulado.", refs: [ref(39,28,19,"Mateus 28:19"),ref(43,2,38,"Atos 2:38"),ref(43,8,36,"Atos 8:36"),ref(44,6,4,"Romanos 6:4")] },
  { name: "Igreja", description: "O povo de Cristo chamado à adoração, comunhão, serviço e missão.", refs: [ref(39,16,18,"Mateus 16:18"),ref(43,2,42,"Atos 2:42"),ref(45,12,27,"1 Coríntios 12:27"),ref(48,4,12,"Efésios 4:12")] },
  { name: "Santidade", description: "Vida separada para Deus como fruto da graça.", refs: [ref(2,19,2,"Levítico 19:2"),ref(44,12,1,"Romanos 12:1"),ref(51,4,3,"1 Tessalonicenses 4:3"),ref(59,1,15,"1 Pedro 1:15")] },
  { name: "Amor", description: "Amor a Deus e ao próximo revelado plenamente em Cristo.", refs: [ref(39,22,37,"Mateus 22:37"),ref(45,13,4,"1 Coríntios 13:4"),ref(61,4,8,"1 João 4:8"),ref(61,4,19,"1 João 4:19")] },
  { name: "Família", description: "Relacionamentos vividos com fidelidade, honra, cuidado e amor.", refs: [ref(0,2,24,"Gênesis 2:24"),ref(19,22,6,"Provérbios 22:6"),ref(48,5,25,"Efésios 5:25"),ref(48,6,1,"Efésios 6:1")] },
  { name: "Esperança", description: "Confiança no cumprimento das promessas de Deus.", refs: [ref(18,42,5,"Salmos 42:5"),ref(44,5,5,"Romanos 5:5"),ref(44,15,13,"Romanos 15:13"),ref(59,1,3,"1 Pedro 1:3")] },
  { name: "Volta de Cristo", description: "A promessa de que Jesus retornará em glória.", refs: [ref(39,24,30,"Mateus 24:30"),ref(43,1,11,"Atos 1:11"),ref(51,4,16,"1 Tessalonicenses 4:16"),ref(65,22,20,"Apocalipse 22:20")] },
  { name: "Ressurreição", description: "Cristo ressuscitou e seu povo também ressuscitará.", refs: [ref(39,28,6,"Mateus 28:6"),ref(42,11,25,"João 11:25"),ref(45,15,20,"1 Coríntios 15:20"),ref(45,15,52,"1 Coríntios 15:52")] },
  { name: "Reino de Deus", description: "O governo salvador de Deus anunciado e inaugurado por Jesus.", refs: [ref(39,6,10,"Mateus 6:10"),ref(40,1,15,"Marcos 1:15"),ref(41,17,21,"Lucas 17:21"),ref(43,28,31,"Atos 28:31")] },
  { name: "Justificação", description: "Declaração graciosa de Deus que recebe o pecador pela fé em Cristo.", refs: [ref(44,3,24,"Romanos 3:24"),ref(44,5,1,"Romanos 5:1"),ref(47,2,16,"Gálatas 2:16"),ref(47,3,11,"Gálatas 3:11")] },
  { name: "Palavra de Deus", description: "As Escrituras como autoridade para fé, doutrina e vida.", refs: [ref(18,119,105,"Salmos 119:105"),ref(54,3,16,"2 Timóteo 3:16"),ref(57,4,12,"Hebreus 4:12"),ref(60,1,21,"2 Pedro 1:21")] },
];

export const STUDIES = [
  { title: "Salvação", subtitle: "Pela graça, mediante a fé em Jesus Cristo", refs: ["Romanos 3:23-24","Efésios 2:8-10","Romanos 10:9-10"], sections: ["Todos pecaram e não podem comprar a reconciliação com Deus por obras ou mérito.","Jesus morreu pelos pecados e ressuscitou. Nele há perdão, justificação e nova vida.","A resposta bíblica envolve arrependimento, fé, confissão de Jesus como Senhor e perseverança como fruto da graça."] },
  { title: "Graça", subtitle: "O favor livre e soberano de Deus", refs: ["João 1:16-17","Romanos 5:8","Tito 2:11-14"], sections: ["Graça não é salário nem dívida de Deus para com o ser humano; é favor concedido a quem não poderia exigi-lo.","A graça salva e também educa o crente para rejeitar a impiedade.","Boas obras não são o preço da salvação, mas fruto de uma vida alcançada por Cristo."] },
  { title: "Pecado", subtitle: "Culpa, corrupção e necessidade de reconciliação", refs: ["Gênesis 3","Romanos 3:9-26","1 João 1:5-10"], sections: ["Pecado é mais que erro: é desobediência, incredulidade e rebelião contra Deus.","O pecado rompe a comunhão com Deus, traz culpa e alcança pensamentos, afetos e ações.","A confissão verdadeira não esconde o pecado; volta-se para a misericórdia de Deus em Cristo."] },
  { title: "Jesus Cristo", subtitle: "Filho de Deus, Senhor e Salvador", refs: ["João 1:1-18","Colossenses 1:15-20","Filipenses 2:5-11"], sections: ["Jesus é verdadeiro Deus e verdadeiro homem, o Verbo que se fez carne.","Sua morte foi pelos pecados; sua ressurreição venceu a morte e confirma seu senhorio.","Ele é o único mediador e voltará com poder e glória."] },
  { title: "Bíblia", subtitle: "A Palavra escrita e a autoridade final", refs: ["Salmos 119:97-105","2 Timóteo 3:14-17","2 Pedro 1:19-21"], sections: ["Os 66 livros do cânon protestante contam a história da criação, queda, redenção e consumação.","Cada texto deve ser lido considerando autor, destinatário, gênero, contexto e lugar na história bíblica.","Estudos e dicionários auxiliam, mas permanecem subordinados às Escrituras."] },
  { title: "Evangelho do Reino", subtitle: "A boa notícia do governo salvador de Deus", refs: ["Marcos 1:14-15","Lucas 4:16-21","1 Coríntios 15:1-4"], sections: ["Jesus anunciou que o Reino de Deus havia chegado e chamou ao arrependimento e à fé.","O centro do Evangelho é a morte e a ressurreição de Cristo segundo as Escrituras.","O Reino já se manifesta no senhorio de Cristo e será consumado em sua volta."] },
  { title: "Batismo", subtitle: "Confissão pública e discipulado", refs: ["Mateus 28:18-20","Atos 2:37-41","Romanos 6:1-4"], sections: ["Jesus ordenou fazer discípulos e batizá-los em nome do Pai, do Filho e do Espírito Santo.","No Novo Testamento, o batismo acompanha a resposta de fé e a entrada visível na comunidade cristã.","A água não compra a salvação; aponta para a união com Cristo, sua morte e ressurreição."] },
];

export const ORIGINAL_WORDS = {
  old: [
    { script: "אֱלֹהִים", transliteration: "Elohim", pronunciation: "e-lo-RRÍM", meaning: "Deus" },
    { script: "חֶסֶד", transliteration: "hesed", pronunciation: "RRÉ-sed", meaning: "amor leal, misericórdia" },
    { script: "שָׁלוֹם", transliteration: "shalom", pronunciation: "sha-LOM", meaning: "paz, integridade, bem-estar" },
    { script: "בְּרִית", transliteration: "berit", pronunciation: "be-RIT", meaning: "aliança" },
    { script: "יְשׁוּעָה", transliteration: "yeshuah", pronunciation: "ye-shu-Á", meaning: "salvação, livramento" },
    { script: "רוּחַ", transliteration: "ruach", pronunciation: "RU-arr", meaning: "espírito, vento, sopro" },
  ],
  new: [
    { script: "χάρις", transliteration: "charis", pronunciation: "RRÁ-ris", meaning: "graça, favor" },
    { script: "πίστις", transliteration: "pistis", pronunciation: "PÍS-tis", meaning: "fé, fidelidade" },
    { script: "σωτηρία", transliteration: "sōtēria", pronunciation: "so-te-RI-a", meaning: "salvação" },
    { script: "μετάνοια", transliteration: "metanoia", pronunciation: "me-TÁ-noi-a", meaning: "arrependimento, mudança de mente" },
    { script: "ἀγάπη", transliteration: "agapē", pronunciation: "a-GÁ-pe", meaning: "amor" },
    { script: "κύριος", transliteration: "kyrios", pronunciation: "KÍ-ri-os", meaning: "Senhor" },
    { script: "Χριστός", transliteration: "Christos", pronunciation: "rris-TÓS", meaning: "Cristo, Ungido" },
    { script: "εὐαγγέλιον", transliteration: "euangelion", pronunciation: "eu-an-GUÉ-li-on", meaning: "evangelho, boa notícia" },
  ],
};
