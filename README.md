<h1 align="center">Family Challenge – Visão Geral Full Stack</h1>

Documento unificado descrevendo arquitetura, padrões, decisões e execução das camadas **Backend (API NestJS)** e **Frontend (Angular 17)** do desafio Family Challenge.

---
## 🧭 Sumário
1. Contexto Geral
2. Visão Arquitetural
3. Backend – Objetivos & Implementação
4. Frontend – Objetivos & Implementação
5. Integração (Fluxo End‑to‑End)
6. Execução (Local & Docker)
7. Endpoints (Contrato da API)
8. Validações & Regras de Negócio
9. Paginação & Busca
10. Testes (Cobertura Conceitual)
11. Padrões & Decisões Chave
12. Roadmap / Evoluções Futuras
13. Licença & Notas Finais

---
## 1. Contexto Geral
Aplicação para cadastro, consulta e manutenção de pessoas formando relações familiares simples (pais e descendentes diretos). Foco em demonstrar: modelagem de domínio limpa, separação de camadas, consistência de estado no front e robustez de regras (datas, relações, integridade).

---
## 2. Visão Arquitetural
| Camada | Tecnologia | Responsabilidade Principal |
|--------|------------|----------------------------|
| API / Domínio | NestJS, Typescript | Regras de negócio, invariantes, persistência in-memory, endpoints REST |
| Frontend | Angular 17 (Standalone Components), ComponentStore, Angular Material | UX, interação, estado local reativo, formatação e orquestração de chamadas |
| Cross-Cutting | Interceptors (Front/Back), DTOs, Mappers | Normalização de dados, validação de entrada/saída, tratamento de erros |

Fluxo Resumido: UI dispara ação → Store aciona Service → Chamada HTTP → Repositório InMemory → Entidade Domain valida → Resposta volta → Atualização de estado local.

---
## 3. Backend – Objetivos & Implementação
### ✅ Objetivos Atendidos
- CRUD de "Family" (Pessoa).
- Relações pai/mãe → filhos (carregamento imediato de pais e descendentes diretos).
- Paginação + filtro textual (nome ou documento) com normalização (case + acentos).
- Validações de domínio (datas, relações, tamanhos de campos, consistência temporal).
- Testes unitários: domínio, repositório, serviço, mapper, value object.

### 🧱 Estrutura (resumo)
```
src/
  core/              (Entity base, UniqueEntityID, validação)
  modules/family/
    domain/          (Entidade Family)
    repositories/    (Interface + implementação in-memory)
    services/        (Orquestração / aplicação)
    controllers/     (HTTP layer)
    mappers/         (domain <-> persistence/presenter)
    dtos/            (validação entrada)
  shared/
    types/           (ListPaginated)
    utils/           (normalizeBasic)
```

### 🧠 Padrões Principais (Backend)
1. Repository Pattern – abstrai fonte de dados in-memory.
2. Data Mapper – separa formatação de persistência e apresentação.
3. Value Object (`UniqueEntityID`) – identidade imutável.
4. Domain Entity rica (`Family`) – mantém invariantes internas.
5. Dependency Inversion – serviços dependem de interface de repositório.

### 🏗️ Decisões
- **Persistência InMemory**: requisito do desafio; facilita prototipagem.
- **Separação domain vs mapeamento**: reduz acoplamento e favorece testes do núcleo.
- **Normalização centralizada**: busca consistente (casefold + remoção de acentos).
- **Validação granular**: funções privadas especializadas (nome, documento, temporal, relações).

---
## 4. Frontend – Objetivos & Implementação
### ✅ Objetivos Atendidos
- CRUD de família + listagem paginada e filtro textual.
- Detalhes em modal ou bottom sheet (mobile friendly).
- Formatação + ocultação parcial de CPF (pipe customizada).
- Recarregamento pós criação/remoção (sincronismo do estado perceptível para o usuário).
- Interceptores para prefixo de API e tratamento de erros.

### 🧱 Estrutura (resumo)
```
src/
  main.ts
  app/
    core/interceptors/        (ApiInterceptor, ErrorInterceptor)
    features/modules/families/
      components/
        list-families-container/  (container + store local)
        modal-create-update-family/
        modal-family-details/     (component + store)
      service/        (FamiliesService)
      dto/            (CreateUpdate / Filter)
      models/         (FamilyModel)
    shared/
      pipes/          (CpfPipe)
      models/         (ListPaginated)
      stores/         (futuras extensões)
```

### 🧠 Padrões Principais (Frontend)
1. Component Store – estado reativo encapsulado por contexto UI.
2. HTTP Interceptors – cross-cutting (base URL, formatação de erro).
3. Service Layer – abstração REST (`FamiliesService`).
4. DTO Contracts – fronteiras de dados claras.
5. Presentation Container – separação container (orquestra) / modais (interação pontual).

### 🏗️ Decisões
- **Standalone Components**: redução de boilerplate de NgModules.
- **ComponentStore > NgRx global**: escopo atual não exige state global; evita complexidade.
- **Reset de página após criação**: garante visibilidade imediata do novo item.
- **Pipe CPF custom**: evita dependência pesada para formatação simples.
- **Testes focados**: pipe, interceptores, serviço e stores priorizados; suite de container marcada para ajuste futuro.

---
## 5. Integração (Fluxo End‑to‑End)
1. Usuário digita filtro → debounce (500ms) → `setFilter` + `loadFamilies$`.
2. Store chama `FamiliesService.getFamilies` → API `/families` com query params.
3. Backend aplica normalização + paginação → retorna `ListPaginated`.
4. Store atualiza `families` e `total` → tabela reflete estado.
5. Criação: modal envia DTO → POST → sucesso → front força `page=0` + recarrega.
6. Exclusão: DELETE → efeito `deleteFamily$` chama `loadFamilies$` ao confirmar.
7. Detalhes: GET `/families/:id` retornando pais/filhos imediatos.

---
## 6. Execução (Local & Docker)
### Backend (exemplo)
```bash
pnpm install
pnpm run start:dev
# Porta padrão: 3000
```
Docker (exemplo ambiente backend):
```bash
docker compose up --build
```

### Frontend
```bash
pnpm install
pnpm start
# http://localhost:4200
```
Ou via Docker:
```bash
docker-compose up --build
```

### Testes
Backend:
```bash
pnpm test       # unit
pnpm test:e2e   # e2e
pnpm test:cov   # coverage
```
Frontend:
```bash
pnpm test        # headless
pnpm run test:ci # headless + coverage
```

---
## 7. Endpoints (Contrato da API)
Base: `http://localhost:3000`

| Método | Path              | Descrição                       | Body                     | Principais Respostas |
|--------|-------------------|---------------------------------|--------------------------|----------------------|
| GET    | /families         | Lista paginada + filtro         | -                        | 200                  |
| GET    | /families/:id     | Detalhe de pessoa/família       | -                        | 200, 404             |
| POST   | /families         | Cria pessoa                     | CreateUpdateFamilyDto    | 201, 400, 404*       |
| PUT    | /families/:id     | Atualiza pessoa                 | CreateUpdateFamilyDto    | 200, 400, 404        |
| DELETE | /families/:id     | Remove pessoa                   | -                        | 204, 404             |

*404 quando pai/mãe referenciados não encontrados.

Formato de lista (exemplo):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "John Doe",
      "birthDate": "1990-05-20T00:00:00.000Z",
      "document": "123456",
      "fatherId": null,
      "motherId": null
    }
  ],
  "total": 42
}
```

---
## 8. Validações & Regras de Negócio
### Backend (Domínio)
- `name`: 2–120 chars.
- `document`: 1–50 chars.
- `birthDate`: >= 1900-01-01 e não futura.
- Temporal: pais mais velhos que filhos.
- Relações: pai ≠ mãe; ninguém é seu próprio pai/mãe; referências devem existir.

### Frontend (UI / Convenções)
- Campos obrigatórios marcados (nome, documento, data).
- CPF formatado/mascarado (pipe) – limita 11 dígitos, pode ocultar bloco central.
- Relações opcionais (IDs podem ser null).
- Debounce em busca (500ms) + `distinctUntilChanged`.

---
## 9. Paginação & Busca
| Aspecto | Backend | Frontend |
|---------|---------|----------|
| Parâmetros | `page`, `limit`, `search` | idem (DTO) |
| Normalização | lowercase + remove acentos | delega a API |
| Reset após criação | ajusta lista com novo item (via filtro page 0) | força `setFilter({page:0})` |
| Algoritmo | offset = page * limit | apenas consome resposta |

---
## 10. Testes (Cobertura Conceitual)
| Área | Backend | Frontend |
|------|---------|----------|
| Domínio / Entidade | invariantes Family | (n/a) – consumido via API |
| Repositório | CRUD, paginação, busca | (n/a) |
| Serviço / Effects | criação, update, relações | ComponentStore effects (load/create/update/delete) |
| Mapper / DTO | round trip + presenter | DTO usado em serviço (tipagem) |
| Interceptores | (se aplicável minimal) | prefix + error handling |
| Pipes / Utils | normalização indireta | `CpfPipe` (format/hide/unmask) |
| Componentes | (não aplicável) | Modal de detalhes, (container pending) |

Status: frontend mantém 20 specs ativas; container list desativado temporariamente para ajuste de injeção de store.

---
## 11. Padrões & Decisões Chave (Resumo)
| Padrão | Justificativa | Camada |
|--------|---------------|--------|
| Repository | Troca fácil de persistência | Backend |
| Data Mapper | Desacoplar domínio de formatos | Backend |
| Value Object | Identidade segura | Backend |
| Component Store | Estado localizado e previsível | Frontend |
| Interceptors | Cross-cutting unificado | Ambos |
| DTO Contracts | Fronteiras claras de dados | Ambos |
| Presentation Container | Separar orquestração de UI | Frontend |

---
## 12. Roadmap / Evoluções Futuras
### Backend
- Persistência real (PostgreSQL/Prisma) implementando `IFamilyRepository`.
- Use Cases dedicados (Application Layer explícita).
- Cache de buscas / índices para escala.
- Árvore de descendência completa (recursiva) em endpoint separado.

### Frontend
- Reativar e estabilizar testes de container principal.
- Testes end-to-end (Cypress / Playwright).
- i18n + acessibilidade (ARIA, foco, navegação teclado).
- Checksum / validação formal de CPF no client.
- Sistema de notificações de erro/sucesso.
- Memoização de páginas populares / pré-busca.

### Transversais
- Observabilidade (logs estruturados, métricas).
- Pipeline CI (lint, test, coverage gates).
- Feature flags para experimentos (ex.: busca expandida).

---
## 13. Licença & Notas Finais
Licença: MIT (uso livre para avaliação técnica).

Este documento consolida o "o quê" e o "por quê" de cada camada, servindo como ponto de partida para onboarding e evolução. Dúvidas adicionais: abrir issue ou estender seções correspondentes.

---
<h4 align="center">FIM</h4>
