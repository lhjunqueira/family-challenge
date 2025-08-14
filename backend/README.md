<h1 align="center">Backend - Family Challenge</h1>

API em NestJS para cadastro e consulta de pessoas em uma árvore familiar simples (pais e descendentes diretos).

## ✅ Objetivos Atendidos

- CRUD de "Family" (Pessoa)
- Relacionamento pai/mãe -> filhos (carregamento imediato de pais e descendentes diretos)
- Paginação + filtro textual (nome ou documento) com normalização (case + acentos)
- Validações de domínio robustas (datas, relações, tamanhos de campos)
- Testes unitários e de serviço

## 🧱 Estrutura de Pastas (resumo)

```
src/
  core/              (building blocks: Entity, UniqueEntityID, validação)
  modules/family/
    domain/          (Entidade Family + testes)
    repositories/    (Interface + implementação in-memory)
    services/        (Regras de aplicação/orquestração)
    controllers/     (HTTP layer)
    mappers/         (Data Mapper: domain <-> persistence/presenter)
    dtos/            (validação de entrada)
  shared/
    types/           (ListPaginated)
    utils/           (normalizeBasic)
```

## 🧠 Design Patterns Aplicados

1. Repository Pattern (`FamilyRepository`, interface `IFamilyRepository`): encapsula fonte de dados (in-memory) e expõe contrato estável para a aplicação. Permite futura troca por banco real sem impacto no serviço nem no domínio.
2. Data Mapper (`FamilyMapper`): converte entre entidade de domínio, formato de persistência e presenter de saída sem acoplar a entidade a formatos externos.
3. Value Object (`UniqueEntityID`): encapsula identidade imutável e igualdade sem espalhar strings/UUID cru pela aplicação.
4. Domain Entity (DDD) (`Family`): concentra invariantes (validação de datas, consistência de relações, regras de self‑parent) e comportamento coeso.
5. Dependency Inversion / Inversion of Control: serviço depende da interface (`IFamilyRepository`) via token `FAMILY_REPOSITORY` (injeção Nest), reduzindo acoplamento a implementação concreta.

## 🏗️ Decisões de Arquitetura

- In-memory Storage: Atende ao requisito do teste e simplifica execução. Facilidade para evoluir: basta criar adaptador que implemente `IFamilyRepository`.
- Separação Domain vs Application: Entidade não conhece mais o mapper (remoção de `toPresenter`/`toPersistence`), reduzindo dependências de saída.
- Validação agregada em helpers privados: `validateName`, `validateDocument`, `validateTemporalProps`, `validateRelations` facilitam manutenção.
- Normalização de busca centralizada em `normalizeBasic` evita duplicação e garante consistência.
- Testes focados em invariantes críticos (datas, relações, cascata) para dar confiança em futuras mudanças.

## ▶️ Como Executar Localmente

Pré-requisitos: Node 20+, pnpm 10+

Instalação:

```bash
pnpm install
```

Executar em watch:

```bash
pnpm run start:dev
```

Rodar com Docker Compose (porta configurável via DEV_PORT):

```bash
export DEV_PORT=3000
docker compose up --build
```

Testes:

```bash
pnpm test          # unit
pnpm test:e2e      # e2e
pnpm test:cov      # coverage
```

## 📡 Endpoints

Base URL padrão: `http://localhost:3000`

### GET /families/:id

Retorna pessoa pelo UUID.
Resposta 200:

```json
{
  "id": "uuid",
  "name": "John Doe",
  "birthDate": "1990-05-20T00:00:00.000Z",
  "document": "123456",
  "fatherId": null,
  "motherId": null,
  "father": { ... },
  "mother": { ... },
  "children": [ { ... } ]
}
```

404 se não encontrado.

### GET /families

Lista paginada.
Query params:

- `page` (number, opcional, default 0)
- `limit` (number, opcional, default 10)
- `search` (string, opcional – nome ou documento, case/acentos ignorados)

Resposta 200:

```json
{
  "items": [
    {
      "id": "...",
      "name": "...",
      "birthDate": "...",
      "document": "...",
      "fatherId": null,
      "motherId": null
    }
  ],
  "total": 42
}
```

### POST /families

Cria nova pessoa.
Body:

```json
{
  "name": "John Doe",
  "birthDate": "1990-05-20T00:00:00.000Z",
  "document": "123456",
  "fatherId": null,
  "motherId": null
}
```

Respostas:

- 201 objeto criado
- 400 validação falhou
- 404 pai/mãe não encontrados (se informados)

### PUT /families/:id

Atualiza pessoa.
Body (mesmo formato do POST). Regras de validação idênticas.
Respostas:

- 200 atualizado
- 400 validação falhou
- 404 não encontrado / pai / mãe ausentes

### DELETE /families/:id

Remove (soft logic + cascata de referências parentId -> null). Implementação atual simplesmente remove do array e limpa ligações.
Respostas:

- 204 sucesso
- 404 não encontrado

## 🛡️ Validações Principais

- Name: 2–120 chars.
- Document: 1–50 chars.
- BirthDate: >= 1900-01-01 e não futura.
- Consistência temporal: `father.birthDate` e `mother.birthDate` < `child.birthDate`.
- Relações: pai ≠ mãe, pai/mãe ≠ self, IDs coerentes com entidades associadas.

## 🔍 Paginação & Busca

- Paginação baseada em índice (page \* limit)
- Normalização: lowercase + remoção de acentos.
- Busca em nome OU documento.

## 🧪 Testes (resumo)

- `domain`: invariantes e cenários inválidos (self parent, pais iguais, datas inconsistentes)
- `repository`: persist, update, cascade delete, paginação + busca
- `service`: criação, update, carregamento de relações (pais/filhos), erros not found
- `mapper`: round trip domínio <-> persistência & presenter com relações
- `core`: `UniqueEntityID`

## 🚀 Futuras Evoluções (não requeridas pelo teste)

- Persistência real (PostgreSQL / Prisma) implementando `IFamilyRepository`.
- Camada de Use Cases separados do service.
- Especificações/validators desacoplados para cada regra complexa.
- Filhos recursivos (árvore completa) ou endpoints dedicados.
- Cache / index para filtro em produção.

## 📄 Licença

Uso apenas para finalidade do teste técnico.

---

Qualquer dúvida sobre decisões ou trade-offs, consultar seção de Design Patterns ou abrir issue.
