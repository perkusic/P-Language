# Reprodução das verificações

Ambiente: P 3.1.0.0, .NET SDK 8.0.427, Python 3.14.4,
OpenJDK 17.0.20+8 Microsoft. Todos os caminhos abaixo partem desta pasta de revisão.
`snapshot.json` identifica os bytes avaliados, não apenas o commit.

As cópias já existem. `prepare_review.py` e `prepare_probe.py` não sobrescrevem
cópias existentes. A segunda sonda altera somente a rota de R2 para 0 → 1 → 2
e retira a criação do humano; não implementa um novo DirectionGuard.

No diretório `validation/project-copy/MobileRobots`:

```powershell
p compile
p check -tc tcFleetTwoPhase -s 10000 --seed 2 --timeout 30 --outdir ../../twophase-output
p check -tc tcFleetNaive -s 10000 --seed 2 --timeout 10 --outdir ../../naive-output
p check -tc tcFleetSanctionFairness -s 10000 --seed 2 --timeout 10 --outdir ../../fairness-output
```

No diretório `validation/project-copy/MobileRobots/pobserve/src/main`:

```powershell
p compile --mode pobserve
```

No diretório `validation/same-direction-no-human/MobileRobots`:

```powershell
p compile
p check -tc tcFleetSanctionFairness -s 10000 --seed 2 --timeout 10 --outdir ../../same-direction-output
```

O timeout usa tempo de parede; outra execução pode explorar um número diferente
de escalonamentos. Para reproduzir um contraexemplo, usar o `.schedule` salvo
na respectiva pasta `BugFinding` com `p check --replay <arquivo>` na mesma cópia.
O replay não foi executado nesta revisão. Falhas intencionais de monitores
produziram código de saída 1 e traces com a asserção identificada no relatório.

Scripts `inspect_documents.py` e `check_snapshot.py` podem ser executados a partir
da raiz do repositório para verificar estrutura/cópias e integridade da fonte.
O segundo também registra os resultados do espelho Python em `validation/checks.json`.
Os logs foram gerados com o script original, cenário fleet, 60 ticks, políticas
naive/seed 2 e twophase/seed 1. Não representam execução PObserve.
