# REVANDA.CD — Analyse Technique Complète de l'Architecture

> Générée le 20 avril 2026  
> Plateforme : Marketplace B2B multivendeur – Revente d'immobilisations corporelles

---

## 1. Structure du Projet & Architecture

### Organisation (monorepo npm workspaces)

```
revanda-cd/
├── package.json               # Monorepo root (npm workspaces)
├── docker-compose.yml         # PostgreSQL local
├── .env.example               # Variables d'env racine
├── README.md
└── packages/
    ├── api/                   # Backend Express + TypeScript
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── prisma/
    │   │   └── schema.prisma  # Schéma de base de données
    │   └── src/
    │       ├── index.ts               # Point d'entrée serveur
    │       ├── config/database.ts
    │       ├── models/Product.ts      # Interface modèle simple
    │       ├── types/index.ts         # Types TypeScript partagés
    │       ├── routes/
    │       │   ├── index.ts
    │       │   ├── auth.ts
    │       │   ├── products.ts
    │       │   ├── orders.ts
    │       │   ├── payments.ts
    │       │   ├── vendor.ts
    │       │   ├── messages.ts
    │       │   └── reviews.ts
    │       ├── controllers/
    │       │   ├── authController.ts
    │       │   ├── productController.ts
    │       │   ├── orderController.ts
    │       │   ├── paymentController.ts
    │       │   ├── vendorController.ts
    │       │   ├── messageController.ts
    │       │   └── reviewController.ts
    │       ├── services/
    │       │   ├── authService.ts
    │       │   ├── productService.ts
    │       │   ├── orderService.ts
    │       │   └── vendorService.ts
    │       ├── middleware/
    │       │   ├── auth.ts
    │       │   ├── errorHandler.ts
    │       │   ├── rateLimit.ts
    │       │   └── validation.ts
    │       └── utils/helpers.ts
    └── web/                   # Frontend React + Vite + TypeScript
        ├── package.json
        ├── vite.config.ts
        ├── tsconfig.json
        ├── tailwind.config.js
        ├── index.html
        └── src/
            ├── main.tsx               # Point d'entrée React
            ├── App.tsx
            ├── root.tsx
            ├── index.css              # Variables CSS + styles globaux
            ├── router/
            │   ├── index.tsx
            │   └── ProtectedRoute.tsx
            ├── layouts/
            │   └── Layout.tsx
            ├── pages/
            │   ├── HomePage.tsx
            │   ├── LoginPage.tsx
            │   ├── RegisterPage.tsx
            │   ├── ProductsPage.tsx
            │   └── DashboardPage.tsx
            ├── components/
            │   ├── Header.tsx
            │   ├── Sidebar.tsx
            │   ├── NotificationCenter.tsx
            │   ├── ProductCard.tsx
            │   ├── Button.tsx
            │   └── LoadingSpinner.tsx
            ├── store/
            │   ├── authStore.ts
            │   ├── productStore.ts
            │   └── uiStore.ts
            ├── services/
            │   ├── api.ts
            │   ├── auth.ts
            │   ├── products.ts
            │   └── users.ts
            ├── hooks/
            │   ├── useApi.ts
            │   ├── useAuth.ts
            │   └── useProducts.ts
            ├── context/store.ts
            └── utils/helpers.ts
```

---

## 2. Schéma de Base de Données (Prisma)

Fichier : `packages/api/prisma/schema.prisma`  
Datasource : **PostgreSQL** (`DATABASE_URL` + `DIRECT_URL`)

### Énumérations

| Enum              | Valeurs                                                                |
|-------------------|------------------------------------------------------------------------|
| `UserRole`        | `CUSTOMER`, `VENDOR`, `ADMIN`                                          |
| `ProductStatus`   | `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `ARCHIVED`       |
| `OrderStatus`     | `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED` |
| `PaymentStatus`   | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`                           |
| `ShipmentProvider`| `PLATFORM`, `VENDOR`                                                   |
| `MessageSender`   | `CUSTOMER`, `VENDOR`                                                   |

### Modèles et Relations

#### `User`
| Champ         | Type       | Détails                            |
|---------------|------------|------------------------------------|
| id            | String     | CUID, clé primaire                 |
| email         | String     | Unique                             |
| passwordHash  | String     |                                    |
| fullName      | String     |                                    |
| role          | UserRole   | Défaut : CUSTOMER                  |
| isActive      | Boolean    | Défaut : true                      |
| createdAt     | DateTime   |                                    |
| updatedAt     | DateTime   |                                    |

Relations : `vendorProfile?` → Vendor, `orders[]` → Order, `reviews[]` → Review, `sentMessages[]` → Message

---

#### `Vendor`
| Champ            | Type    | Détails                  |
|------------------|---------|--------------------------|
| id               | String  | CUID                     |
| userId           | String  | Unique → User (Cascade)  |
| companyName      | String  |                          |
| taxNumber        | String? |                          |
| subscriptionPlan | String? |                          |
| isVerified       | Boolean | Défaut : false           |

Relations : `products[]`, `orderItems[]`, `payments[]`, `shipments[]`, `vendorStats?`, `messages[]`, `reviews[]`

---

#### `Category`
| Champ    | Type    | Détails                |
|----------|---------|------------------------|
| id       | String  | CUID                   |
| name     | String  |                        |
| slug     | String  | Unique                 |
| parentId | String? | Auto-référence         |

Relations : `parent?` → Category, `children[]` → Category, `products[]`

---

#### `Product`
| Champ            | Type          | Détails                     |
|------------------|---------------|-----------------------------|
| id               | String        | CUID                        |
| vendorId         | String        | FK → Vendor (Cascade)       |
| categoryId       | String        | FK → Category               |
| name             | String        |                             |
| description      | String        |                             |
| price            | Decimal(12,2) |                             |
| currency         | String        | Défaut : "USD"              |
| validationStatus | ProductStatus | Défaut : PENDING_APPROVAL   |
| isPublished      | Boolean       | Défaut : false              |
| stock            | Int           | Défaut : 0                  |

Relations : `variants[]`, `orderItems[]`, `reviews[]`

---

#### `ProductVariant`
| Champ      | Type     | Détails              |
|------------|----------|----------------------|
| sku        | String   | Unique               |
| size       | String?  |                      |
| color      | String?  |                      |
| attributes | Json?    |                      |
| price      | Decimal? | Override du produit  |
| quantity   | Int      | Défaut : 0           |

---

#### `Order`
| Champ       | Type          | Détails                  |
|-------------|---------------|--------------------------|
| id          | String        | CUID                     |
| customerId  | String        | FK → User                |
| status      | OrderStatus   | Défaut : PENDING         |
| totalAmount | Decimal(12,2) |                          |
| currency    | String        | Défaut : "USD"           |

Relations : `items[]`, `payments[]`, `shipments[]`

---

#### `OrderItem`
| Champ     | Type          | Détails             |
|-----------|---------------|---------------------|
| orderId   | String        | FK → Order (Cascade)|
| productId | String        | FK → Product        |
| variantId | String?       | FK → ProductVariant |
| vendorId  | String        | FK → Vendor         |
| quantity  | Int           |                     |
| unitPrice | Decimal(12,2) |                     |
| subtotal  | Decimal(12,2) |                     |
| status    | OrderStatus   | Défaut : PENDING    |

---

#### `Payment`
| Champ            | Type          | Détails            |
|------------------|---------------|--------------------|
| orderId          | String        | FK → Order (Cascade)|
| vendorId         | String        | FK → Vendor        |
| amount           | Decimal(12,2) |                    |
| commissionAmount | Decimal(12,2) |                    |
| status           | PaymentStatus | Défaut : PENDING   |
| providerRef      | String?       |                    |

Relation : `commission?` → Commission

---

#### `Commission`
| Champ     | Type          | Détails                   |
|-----------|---------------|---------------------------|
| paymentId | String        | Unique → Payment (Cascade)|
| rate      | Decimal(5,2)  |                           |
| amount    | Decimal(12,2) |                           |

---

#### `Shipment`
| Champ          | Type             | Détails            |
|----------------|------------------|--------------------|
| orderId        | String           | FK → Order (Cascade)|
| vendorId       | String           | FK → Vendor        |
| provider       | ShipmentProvider | Défaut : PLATFORM  |
| trackingNumber | String?          |                    |
| status         | String           |                    |
| shippedAt      | DateTime?        |                    |
| deliveredAt    | DateTime?        |                    |

---

#### `VendorStats`
| Champ         | Type          | Détails             |
|---------------|---------------|---------------------|
| vendorId      | String        | Unique → Vendor     |
| totalSales    | Decimal(12,2) | Défaut : 0          |
| totalOrders   | Int           | Défaut : 0          |
| averageRating | Float         | Défaut : 0          |
| totalReviews  | Int           | Défaut : 0          |

---

#### `Message`
| Champ          | Type          | Détails         |
|----------------|---------------|-----------------|
| conversationId | String        |                 |
| customerId     | String        | FK → User       |
| vendorId       | String        | FK → Vendor     |
| sender         | MessageSender |                 |
| content        | String        |                 |
| readAt         | DateTime?     |                 |

---

#### `Review`
| Champ      | Type    | Détails                           |
|------------|---------|-----------------------------------|
| productId  | String  | FK → Product (Cascade)            |
| customerId | String  | FK → User (Cascade)               |
| vendorId   | String  | FK → Vendor (Cascade)             |
| rating     | Int     |                                   |
| comment    | String? |                                   |

Contrainte unique : `(productId, customerId)` — un seul avis par client par produit.

---

## 3. Couche API (Routes, Contrôleurs, Services, Middleware)

### Arborescence des endpoints (`/api`)

| Méthode | Endpoint                     | Auth requis | Rôles autorisés        | Description                       |
|---------|------------------------------|-------------|------------------------|-----------------------------------|
| POST    | /auth/register/vendor        | Non         | -                      | Inscription vendeur               |
| POST    | /auth/register/customer      | Non         | -                      | Inscription client                |
| POST    | /auth/login                  | Non         | -                      | Connexion                         |
| POST    | /auth/logout                 | Non         | -                      | Déconnexion (stateless)           |
| POST    | /auth/refresh-token          | Oui         | Tous                   | Rafraîchir le token JWT           |
| GET     | /products                    | Non         | -                      | Lister produits approuvés         |
| GET     | /products/search             | Non         | -                      | Recherche de produits             |
| GET     | /products/:id                | Non         | -                      | Détail d'un produit               |
| POST    | /products                    | Oui         | VENDOR                 | Créer un produit                  |
| PUT     | /products/:id                | Oui         | VENDOR                 | Modifier un produit               |
| DELETE  | /products/:id                | Oui         | VENDOR                 | Supprimer un produit              |
| GET     | /products/my-products        | Oui         | VENDOR                 | Produits du vendeur connecté      |
| POST    | /orders                      | Oui         | Tous                   | Créer une commande                |
| GET     | /orders                      | Oui         | Tous                   | Mes commandes                     |
| GET     | /orders/:id                  | Oui         | Tous (ownership check) | Détail commande                   |
| PUT     | /orders/:id/status           | Oui         | VENDOR/ADMIN           | Changer le statut                 |
| GET     | /payments                    | Oui         | VENDOR, ADMIN          | Mes paiements                     |
| POST    | /payments/webhook            | Non (secret)| -                      | Webhook paiement externe          |
| GET     | /vendor/dashboard            | Oui         | VENDOR, ADMIN          | Stats tableau de bord             |
| GET     | /vendor/sales                | Oui         | VENDOR, ADMIN          | Historique des ventes             |
| POST    | /messages                    | Oui         | Tous                   | Envoyer un message                |
| GET     | /messages/:conversationId    | Oui         | Participants seulement | Historique conversation           |
| POST    | /reviews                     | Oui         | CUSTOMER, ADMIN        | Publier un avis (rating 1-5)      |
| GET     | /reviews/product/:productId  | Non         | -                      | Avis d'un produit                 |

### Middleware appliqué (par couche)

```
[Helmet] → [CORS] → [express.json] → [urlencoded]
    ↓ (pour chaque routeur)
[apiRateLimiter] → [authenticateJWT?] → [requireRole?] → [requireFields?] → [Controller]
```

- **apiRateLimiter** : 100 req/min par IP, en mémoire vive (`middleware/rateLimit.ts:3-49`).
- **authenticateJWT** : vérifie `Authorization: Bearer <token>` et décode le JWT (`middleware/auth.ts:11-27`).
- **requireRole(...roles)** : vérifie que `req.user.role` fait partie des rôles autorisés (`middleware/auth.ts:29-37`).
- **requireFields(...fields)** : rejette la requête si un champ obligatoire est absent (`middleware/validation.ts:3-11`).
- **errorHandler** : retourne `{ message }` avec le bon code HTTP ; `AppError` pour les erreurs métier (`middleware/errorHandler.ts:3-21`).
- **notFoundHandler** : toute route inconnue → 404.

---

## 4. Couche Frontend (Pages, Composants, Routing, État)

### Router (`packages/web/src/router/index.tsx`)

Toutes les routes sont imbriquées dans le layout global (`<Layout />`).

| Chemin                    | Composant / Placeholder       | Protection     |
|---------------------------|-------------------------------|----------------|
| `/`                       | `HomePage`                    | Public         |
| `/login`                  | `LoginPage`                   | Public         |
| `/register`               | `RegisterPage`                | Public         |
| `/products`               | `ProductsPage`                | Public         |
| `/dashboard`              | `DashboardPage`               | Connecté       |
| `/profile`                | Placeholder                   | Connecté       |
| `/settings`               | Placeholder                   | Connecté       |
| `/vendor/products`        | Placeholder                   | vendor         |
| `/vendor/sales`           | Placeholder                   | vendor         |
| `/admin`                  | Placeholder                   | admin/super_admin|
| `/admin/users`            | Placeholder                   | admin/super_admin|
| `/admin/products`         | Placeholder                   | admin/super_admin|
| `/super-admin`            | Placeholder                   | super_admin    |
| `/super-admin/admins`     | Placeholder                   | super_admin    |
| `/super-admin/deletions`  | Placeholder                   | super_admin    |
| `/unauthorized`           | Inline JSX                    | -              |
| `*`                       | 404 Inline JSX                | -              |

### Pages implémentées

- **HomePage** (`pages/HomePage.tsx`) : hero, features, stats, CTA, footer. Navigation contextuelle selon `isAuthenticated`.
- **LoginPage** (`pages/LoginPage.tsx`) : formulaire email/password, appel `authService.login`, stockage token + user.
- **RegisterPage** (`pages/RegisterPage.tsx`) : formulaire name/email/password, appel `authService.register`.
- **ProductsPage** (`pages/ProductsPage.tsx`) : liste + filtres (search + catégorie), chargement via `productService.getAll`.
- **DashboardPage** (`pages/DashboardPage.tsx`) : info utilisateur + liste produits, bouton déconnexion.

### Composants UI

| Composant             | Fichier                          | Rôle                                        |
|-----------------------|----------------------------------|---------------------------------------------|
| `Layout`              | `layouts/Layout.tsx`             | Shell principal : Header + Sidebar + Outlet + Notifications |
| `Header`              | `components/Header.tsx`          | Barre de nav : logo, liens, menu utilisateur|
| `Sidebar`             | `components/Sidebar.tsx`         | Navigation latérale adaptée au rôle         |
| `NotificationCenter`  | `components/NotificationCenter.tsx` | Toasts success/error/warning/info       |
| `ProductCard`         | `components/ProductCard.tsx`     | Carte produit : image, prix, stock, boutons |
| `Button`              | `components/Button.tsx`          | Bouton générique avec variants et état loading|
| `LoadingSpinner`      | `components/LoadingSpinner.tsx`  | Indicateur de chargement                    |

### Gestion d'état (Zustand)

| Store          | Fichier                    | Clés d'état principales                        | Persistance localStorage |
|----------------|----------------------------|-------------------------------------------------|--------------------------|
| `useAuthStore` | `store/authStore.ts`       | `user`, `token`, `isAuthenticated`              | Oui (`auth-storage`)     |
| `useProductStore`| `store/productStore.ts`  | `products`, `selectedProduct`, `filters`, `isLoading`| Non               |
| `useUIStore`   | `store/uiStore.ts`         | `sidebarOpen`, `theme`, `notifications`         | Non                      |

---

## 5. Authentification & Autorisation (JWT + RBAC)

### Backend

1. À l'inscription, `authService` hashage le password avec `bcryptjs` (salt 10), crée un utilisateur en mémoire, génère un JWT signé (`JWT_SECRET`, expire en `JWT_EXPIRES_IN`, défaut `1h`).
2. Token JWT payload : `{ userId, role }`.
3. À chaque requête protégée, `authenticateJWT` vérifie `Authorization: Bearer`, décode le token et injecte `req.user`.
4. `requireRole(...roles)` interdit l'accès si `req.user.role` ne correspond pas.

Fichiers clés : `middleware/auth.ts`, `services/authService.ts`

### Frontend

- `ProtectedRoute` vérifie `isAuthenticated` via `useAuthStore` et redirige vers `/login` si non connecté (`router/ProtectedRoute.tsx:9-23`).
- Rôles frontend : `'customer' | 'vendor' | 'admin' | 'super_admin'` (minuscules + super_admin).

### ⚠️ Incohérences identifiées

| Problème | Backend | Frontend |
|----------|---------|----------|
| Nommage des rôles | Majuscules : `CUSTOMER`, `VENDOR`, `ADMIN` | Minuscules : `customer`, `vendor`, `admin`, `super_admin` |
| Clé du token dans localStorage | - | Intercepteur lit `authToken`, service écrit sous `token` |
| Endpoint inscription | `/auth/register/vendor` et `/auth/register/customer` | Service appelle `/auth/register` |
| Endpoint `GET /auth/me` | Non implémenté | Utilisé par `authService.getCurrentUser()` |

---

## 6. Logique Métier

### Inscription vendeur
Route : `POST /api/auth/register/vendor`  
Champs requis : `email`, `password`, `fullName`, `companyName`  
Flow : `requireFields` → `authController.registerVendor` → `authService.registerVendor` → hash password → store en mémoire → retourne `{ user, token }`.

### Catalogue produits (validation admin)
- Un vendeur crée un produit → statut `PENDING_APPROVAL`.
- Toute modification remet le statut à `PENDING_APPROVAL`.
- Seuls les produits `APPROVED` apparaissent dans le catalogue public (`/api/products`).
- L'admin devra implémenter un endpoint d'approbation (non encore présent).

### Commandes
- `POST /orders` : calcule `totalAmount = Σ(unitPrice × quantity)` → statut `PENDING`.
- `PUT /orders/:id/status` : ADMIN peut changer n'importe quel statut ; VENDOR peut changer si ses produits sont dans la commande.
- Statuts valides : `PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED`.

### Tableau de bord vendeur
- Total produits, produits en attente de validation, somme des ventes (`vendorService.ts:5-14`).

---

## 7. Système de Paiement

- Un endpoint `GET /api/payments` retourne les paiements de l'utilisateur connecté (VENDOR ou ADMIN).
- Un endpoint `POST /api/payments/webhook` reçoit les notifications d'un système externe :
  - Valide le header `x-webhook-secret` contre `PAYMENT_WEBHOOK_SECRET`.
  - Met à jour le statut du paiement dans la liste en mémoire.
- **Stripe** est mentionné dans `packages/web/.env.example` (`VITE_STRIPE_PUBLIC_KEY`), mais aucun SDK Stripe n'est intégré dans le code.
- **État actuel : placeholder/mock, non persisté, non connecté à un PSP réel.**

---

## 8. Définitions TypeScript

### Backend (`packages/api/src/types/index.ts`)

```typescript
type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN'

interface JwtPayload        { userId: string; role: Role }
interface AuthRequest       { user?: JwtPayload }  // extends Express.Request

interface RegisterVendorInput   { email; password; fullName; companyName }
interface RegisterCustomerInput { email; password; fullName }
interface LoginInput            { email; password }

interface ProductInput   { name; description; price; categoryId; stock }
interface ProductFilters { vendorId?; categoryId?; sortBy?; query? }
interface OrderItemInput { productId; vendorId; quantity; unitPrice }
```

Types internes aux services/contrôleurs :
- `StoredUser` (authService), `ProductRecord` (productService), `OrderRecord` + `VendorOrderSummary` (orderService), `PaymentRecord` (paymentController), `MessageRecord` (messageController), `ReviewRecord` (reviewController), `RateBucket` (rateLimit).

### Frontend (`packages/web/src/`)

```typescript
// store/authStore.ts
interface User { id; name; email; role: 'customer'|'vendor'|'admin'|'super_admin'; avatar?; createdAt; updatedAt }
interface AuthStore { user; token; isAuthenticated; setUser; setToken; logout; setAuthState }

// store/productStore.ts
interface Product { id; name; description; price; image; category; stock; vendorId; createdAt; updatedAt }
interface ProductStore { products[]; selectedProduct; filters; isLoading; setProducts; addProduct; updateProduct; deleteProduct; ... }

// store/uiStore.ts
interface Notification { id; type: 'success'|'error'|'warning'|'info'; message; duration? }
interface UIStore { sidebarOpen; theme; notifications[]; toggleSidebar; addNotification; removeNotification; ... }

// services/auth.ts
interface LoginInput    { email; password }
interface RegisterInput { name; email; password; phone? }
interface AuthResponse  { token; user: { id; name; email; role; avatar? } }

// services/products.ts
interface Product             { id; name; description; price; image; category; stock; vendorId; createdAt; updatedAt }
interface CreateProductInput  { name; description; price; image; category; stock }
interface UpdateProductInput  extends Partial<CreateProductInput>

// services/users.ts
interface User               { id; name; email; phone?; avatar?; role; createdAt; updatedAt }
interface DeletionRequest    { id; userId; requestedBy; reason?; status: 'pending'|'approved'|'rejected'; ... }
interface DeletionRequestInput    { userId; reason? }
interface ApproveDeletionInput    { requestId; approved }
```

---

## 9. Configuration

### Variables d'environnement

#### Racine (`/.env.example`)
| Variable                | Description                          |
|-------------------------|--------------------------------------|
| `DATABASE_URL`          | URL Prisma (pooled) PostgreSQL       |
| `DIRECT_URL`            | URL directe Prisma (migrations)      |
| `MONGODB_URL`           | Mentionné mais non utilisé           |
| `API_KEY`               | Clé API générique                    |
| `JWT_SECRET`            | Secret de signature JWT (obligatoire)|
| `PAYMENT_WEBHOOK_SECRET`| Secret pour valider les webhooks     |

#### Frontend (`packages/web/.env.example`)
| Variable                  | Description              |
|---------------------------|--------------------------|
| `VITE_API_URL`            | URL du backend API       |
| `VITE_STRIPE_PUBLIC_KEY`  | Clé publique Stripe      |
| `VITE_MODE`               | `development`/`production`|

### Dépendances principales

#### Backend (`packages/api/package.json`)
| Package       | Version  | Usage                    |
|---------------|----------|--------------------------|
| express       | ^4.18.2  | Framework HTTP           |
| jsonwebtoken  | ^9.0.0   | Génération/vérification JWT|
| bcryptjs      | ^2.4.3   | Hachage des mots de passe|
| cors          | ^2.8.5   | CORS                     |
| helmet        | ^7.0.0   | Headers de sécurité      |
| dotenv        | ^16.6.1  | Variables d'environnement|
| pg            | ^8.9.0   | Driver PostgreSQL        |
| @prisma/client| ^6.19.3  | ORM (schéma défini, usage en cours) |

#### Frontend (`packages/web/package.json`)
| Package            | Version  | Usage                      |
|--------------------|----------|----------------------------|
| react              | ^18.2.0  | Framework UI               |
| react-dom          | ^18.2.0  |                            |
| react-router-dom   | ^6.11.0  | Routing SPA                |
| zustand            | ^4.3.8   | Gestion d'état global      |
| axios              | ^1.4.0   | Requêtes HTTP              |
| tailwindcss        | ^3.3.0   | Utilitaires CSS            |
| vite               | ^8.0.8   | Build tool                 |

### Configuration Docker (`docker-compose.yml`)
- Image `postgres:15-alpine`
- Base : `revandaBD`, user : `postgres`
- Port : `5432:5432`
- Données persistées dans le volume `postgres_data`

---

## 10. Flux de Données Complet (Request Lifecycle)

### Exemple : Connexion utilisateur

```
[React LoginPage]
  → handleSubmit()
  → authService.login({ email, password })       (web/services/auth.ts:28)
  → axios.post('/api/auth/login', data)           (web/services/api.ts intercepteur)
      → Ajoute "Authorization: Bearer <token>" si présent
  → [Express /api/auth/login]
      → apiRateLimiter                            (middleware/rateLimit.ts)
      → requireFields('email', 'password')        (middleware/validation.ts)
      → authController.login()                   (controllers/authController.ts:22)
      → authService.login()                       (services/authService.ts:57)
          → Cherche l'utilisateur en mémoire
          → bcrypt.compare(password, hash)
          → jwt.sign({ userId, role }, JWT_SECRET)
      → res.json({ user, token })
  → Axios intercepteur response: retourne response.data
  → LoginPage: setUser(user) + setToken(token) dans Zustand
  → authService.setToken(token) → localStorage.setItem('token', token)
  → navigate('/dashboard')
```

### État actuel de la persistance

> ⚠️ **Important** : bien que Prisma et PostgreSQL soient configurés, **les services API n'utilisent pas encore Prisma en production**. Toutes les données sont stockées dans des **tableaux JavaScript en mémoire** qui sont réinitialisés à chaque redémarrage du serveur.

| Couche        | Stockage actuel  | Stockage cible (Prisma) |
|---------------|------------------|-------------------------|
| Utilisateurs  | `users[]` (authService) | Table `User` |
| Produits      | `products[]` (productService) | Table `Product` |
| Commandes     | `orders[]` (orderService) | Table `Order` |
| Paiements     | `payments[]` (paymentController) | Table `Payment` |
| Messages      | `messages[]` (messageController) | Table `Message` |
| Avis          | `reviews[]` (reviewController) | Table `Review` |

---

## Résumé : Lacunes identifiées

| N° | Problème                                          | Impact         |
|----|---------------------------------------------------|----------------|
| 1  | Données en mémoire (non persistées)               | Critique       |
| 2  | Nommage des rôles incohérent (maj/min)            | Élevé          |
| 3  | Clé localStorage du token incohérente (`authToken` vs `token`) | Élevé |
| 4  | Endpoint `/auth/register` non aligné avec backend | Élevé          |
| 5  | `GET /auth/me` manquant côté backend              | Élevé          |
| 6  | Stripe mentionné mais non intégré                 | Moyen          |
| 7  | Nombreuses pages admin/vendeur en placeholder     | Moyen          |
| 8  | Aucun endpoint d'approbation de produit (admin)   | Moyen          |
| 9  | Rate limiter en mémoire (non distribué)           | Moyen (prod)   |
| 10 | Logout côté backend est stateless (token non révoqué) | Faible    |

---

*Fichier généré automatiquement à partir de l'analyse du dépôt `JoelPhanzu/revanda-cd`.*
