# 📚 README D'INTÉGRATION SUPABASE - ONE CONNEXION

## 📋 Vue d'ensemble

Cette migration crée l'infrastructure complète PostgreSQL/Supabase nécessaire au fonctionnement de bout en bout de l'application One Connexion, avec :

- ✅ **Numérotation robuste ORD-XXX** (séquence PostgreSQL sûre en concurrence)
- ✅ **Tables complètes** (commandes, clients, chauffeurs, factures, messagerie)
- ✅ **RLS complet** (admin/client/chauffeur avec scopes appropriés)
- ✅ **Fonctions et triggers** (automatisation de la logique métier)
- ✅ **Vues pour dashboard** (statistiques temps réel)
- ✅ **Aucune donnée fictive** (base initiale vide)

## 🗂️ Entités créées

### 1. **Gestion des utilisateurs et rôles**
- `user_roles` : Rôles des utilisateurs (admin, client, chauffeur, dispatch) **[CRITIQUE SÉCURITÉ]**
- `client_profiles` : Profils clients avec secteur d'activité
- `drivers` : Chauffeurs avec véhicules et statuts
- `driver_unavailabilities` : Indisponibilités chauffeurs

### 2. **Gestion des commandes**
- `orders` : Commandes avec numérotation ORD-XXX automatique
- `order_status_history` : Historique complet des statuts
- `order_assignment_events` : Événements d'affectation chauffeur
- `order_administrative_events` : Événements administratifs

### 3. **Facturation**
- `invoices` : Factures mensuelles par client

### 4. **Messagerie**
- `conversations` : Conversations CLIENT↔ADMIN ou DRIVER↔ADMIN
- `conversation_messages` : Messages dans les conversations

### 5. **Notifications**
- `notifications` : Notifications système

### 6. **Vues pour dashboard**
- `monthly_stats` : Statistiques mensuelles agrégées
- `active_orders` : Commandes en cours (temps réel)
- `new_clients_monthly` : Nouveaux clients par mois

## 🔢 Diagramme ERD

```
┌──────────────┐
│  auth.users  │ (Supabase Auth)
└──────┬───────┘
       │
       ├─────────┬──────────────┬──────────────┐
       │         │              │              │
┌──────▼───────┐ │   ┌──────────▼──────────┐  │
│ user_roles   │ │   │ client_profiles     │  │
│ (SÉCURITÉ!)  │ │   │ - sector           │  │
└──────────────┘ │   │ - orders_count     │  │
                 │   └─────────┬───────────┘  │
                 │             │              │
          ┌──────▼────────┐    │       ┌──────▼──────────┐
          │   drivers     │    │       │ conversations   │
          │ - vehicle     │    │       └─────────┬───────┘
          │ - status      │    │                 │
          └───┬───────────┘    │        ┌────────▼────────────┐
              │                │        │ conversation_msg    │
      ┌───────▼──────────┐     │        └─────────────────────┘
      │ driver_unavail   │     │
      └──────────────────┘     │
                              │
                       ┌──────▼────────┐
                       │    orders     │
                       │ - order_number│ (ORD-XXX auto)
                       │ - status      │
                       └───┬───┬───┬───┘
                           │   │   │
            ┌──────────────┘   │   └──────────────┐
            │                  │                  │
   ┌────────▼────────┐ ┌───────▼────────┐ ┌──────▼────────┐
   │ order_status_   │ │ order_assign   │ │ order_admin   │
   │ history         │ │ events         │ │ events        │
   └─────────────────┘ └────────────────┘ └───────────────┘
            │
            │
     ┌──────▼──────┐
     │  invoices   │
     │ (mensuel)   │
     └─────────────┘
```

## 🚀 Exécution de la migration

### Prérequis
- Projet Supabase actif
- Accès à l'éditeur SQL Supabase
- Backup de la base de données (recommandé)

### Étapes d'exécution

1. **Accéder à l'éditeur SQL**
   - Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet : `onptfjkvnmrshsdspqlm`
   - Allez dans **SQL Editor** → **New Query**

2. **Exécuter la migration**
   - La migration a déjà été exécutée automatiquement par Lovable
   - Vérifier que tout s'est bien passé dans l'éditeur SQL
   - En cas d'erreur, consulter les logs dans le dashboard

3. **Vérification post-migration**
   ```sql
   -- Vérifier que les tables existent
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Vérifier la séquence de numérotation
   SELECT * FROM public.order_number_seq;
   
   -- Tester la génération de numéro
   SELECT public.generate_order_number();
   ```

## 🔐 Row Level Security (RLS)

### Politique par rôle

#### **Admin** (`app_role = 'admin'`)
- ✅ **Tout voir et tout gérer** (commandes, clients, chauffeurs, factures, messages)
- ✅ Accès complet aux statistiques
- ✅ Gestion des affectations et annulations

#### **Client** (`app_role = 'client'`)
- ✅ Voir **uniquement ses propres** commandes
- ✅ Créer de nouvelles commandes
- ✅ Voir **uniquement ses propres** factures
- ✅ Participer aux conversations où il est participant
- ❌ Pas d'édition post-création
- ❌ Pas d'accès aux données des autres clients

#### **Chauffeur** (`app_role = 'chauffeur'`)
- ✅ Voir **uniquement les commandes qui lui sont assignées**
- ✅ Colonnes limitées (adresses, date/heure, type, instructions)
- ✅ Participer aux conversations où il est participant
- ❌ Pas d'accès aux montants des commandes
- ❌ Pas d'accès aux commandes des autres chauffeurs

### Exemples de requêtes par rôle

```typescript
// ====== ADMIN ======
// Voir toutes les commandes
const { data: orders } = await supabase
  .from('orders')
  .select('*');

// ====== CLIENT ======
// Voir uniquement ses commandes (RLS appliqué automatiquement)
const { data: myOrders } = await supabase
  .from('orders')
  .select('*');

// ====== CHAUFFEUR ======
// Voir uniquement ses commandes assignées (RLS appliqué automatiquement)
const { data: assignedOrders } = await supabase
  .from('orders')
  .select('id, order_number, pickup_address, delivery_address, schedule_start, driver_instructions');
```

## 🔧 Variables d'environnement

Les variables sont déjà configurées dans `.env` :

```env
VITE_SUPABASE_PROJECT_ID="onptfjkvnmrshsdspqlm"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJI..."
VITE_SUPABASE_URL="https://onptfjkvnmrshsdspqlm.supabase.co"
```

## 📊 Points d'intégration Front/Back

### 1. **Création de commande (Client)**

```typescript
// Front: src/pages/client/CreateOrder.tsx
import { supabase } from '@/integrations/supabase/client';

const createOrder = async (orderData) => {
  // Créer la commande (order_number généré automatiquement via trigger)
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_id: currentClient.id,
      customer_company: currentClient.company,
      sector: currentClient.sector,
      package_type: orderData.packageType,
      pickup_address: orderData.pickupAddress,
      delivery_address: orderData.deliveryAddress,
      schedule_start: new Date(`${orderData.date}T${orderData.time}`),
      weight_kg: orderData.weight,
      volume_m3: orderData.volume,
      amount: orderData.quoteAmount,
      status: 'EN_ATTENTE_AFFECTATION'
    })
    .select()
    .single();

  // order.order_number sera automatiquement "ORD-001", "ORD-002", etc.
  return order;
};
```

### 2. **Affectation chauffeur (Admin)**

```typescript
// Front: src/pages/admin/Orders.tsx
const assignDriver = async (orderId: string, driverId: string) => {
  // Mettre à jour la commande
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      assigned_driver_id: driverId,
      driver_assigned_at: new Date().toISOString(),
      status: 'EN_ATTENTE_ENLEVEMENT'
    })
    .eq('id', orderId);

  // Créer un événement d'affectation
  const { error: eventError } = await supabase
    .from('order_assignment_events')
    .insert({
      order_id: orderId,
      event_type: 'ASSIGNED',
      driver_id: driverId,
      driver_name: driverName,
      author: 'admin'
    });

  // Créer une notification pour le chauffeur
  const { error: notifError } = await supabase
    .from('notifications')
    .insert({
      channel: 'DRIVER',
      user_id: driverUserId,
      order_id: orderId,
      driver_id: driverId,
      message: `Nouvelle mission : ${orderNumber} — ${pickupAddress} → ${deliveryAddress}`,
      read: false
    });
};
```

### 3. **Dashboard Admin (Stats temps réel)**

```typescript
// Front: src/pages/Admin.tsx
const getDashboardStats = async () => {
  const today = new Date();
  const currentMonth = startOfMonth(today);
  const nextMonth = startOfMonth(addMonths(today, 1));
  
  // Statistiques du mois en cours
  const { data: currentMonthStats } = await supabase
    .from('monthly_stats')
    .select('*')
    .eq('month', currentMonth.toISOString())
    .single();

  // Commandes en cours (temps réel)
  const { data: activeOrders } = await supabase
    .from('active_orders')
    .select('*');

  // Nouveaux clients du mois
  const { data: newClients } = await supabase
    .from('new_clients_monthly')
    .select('*')
    .eq('month', currentMonth.toISOString())
    .single();

  return {
    ordersCount: currentMonthStats?.orders_count || 0,
    revenue: currentMonthStats?.total_revenue || 0,
    inProgress: activeOrders?.length || 0,
    newClients: newClients?.new_clients_count || 0
  };
};
```

### 4. **Facturation mensuelle**

```typescript
// Fonction pour générer une facture mensuelle (à exécuter via cron ou edge function)
const generateMonthlyInvoice = async (clientProfileId: string, month: Date) => {
  const periodStart = startOfMonth(month);
  const periodEnd = endOfMonth(month);

  // Récupérer toutes les commandes du client pour le mois
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', clientProfileId)
    .gte('schedule_start', periodStart.toISOString())
    .lte('schedule_start', periodEnd.toISOString())
    .neq('status', 'ANNULEE');

  const totalHT = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const taxRate = 0.20;
  const totalTTC = totalHT * (1 + taxRate);

  // Créer la facture
  const { data: invoice } = await supabase
    .from('invoices')
    .insert({
      invoice_number: `FAC-${format(month, 'yyyy-MM')}-${clientProfileId.slice(0, 6)}`,
      client_profile_id: clientProfileId,
      period_start: periodStart,
      period_end: periodEnd,
      amount_ht: totalHT,
      amount_ttc: totalTTC,
      tax_rate: taxRate,
      status: 'EN_ATTENTE',
      due_date: addDays(endOfMonth(month), 15)
    })
    .select()
    .single();

  // Mettre à jour les commandes avec l'invoice_id
  await supabase
    .from('orders')
    .update({ invoice_id: invoice.id })
    .in('id', orders.map(o => o.id));

  return invoice;
};
```

## ⚡ Performances et optimisations

### Index créés
- `orders` : customer_id, status, assigned_driver_id, schedule_start, created_at, invoice_id, order_number
- `client_profiles` : user_id, sector, created_at
- `drivers` : user_id, status, active
- `order_status_history` : order_id, occurred_at
- `order_assignment_events` : order_id, driver_id, occurred_at
- `invoices` : client_profile_id, status, period (start, end)
- `conversations` : order_id, participant_type + participant_id, updated_at DESC
- `notifications` : user_id, read, created_at DESC

### Recommandations
1. **Pagination** : Toujours limiter les résultats avec `.limit()` et `.range()`
2. **Vues matérialisées** : Envisager si dashboard devient lent (>1000 commandes/mois)
3. **Indexes composites** : Ajouter si requêtes complexes fréquentes

## ✅ Checklist de validation

### 1. Création de commande (Client)
```sql
-- Test : Créer une commande depuis l'espace client
-- Vérifier que :
-- ✅ Le order_number est généré automatiquement (ORD-001, ORD-002, etc.)
-- ✅ La commande apparaît immédiatement dans le dashboard admin
-- ✅ Une entrée dans order_status_history est créée automatiquement
-- ✅ Le compteur orders_count du client est incrémenté

SELECT 
  o.order_number,
  o.status,
  cp.orders_count,
  (SELECT COUNT(*) FROM order_status_history WHERE order_id = o.id) as history_count
FROM orders o
JOIN client_profiles cp ON cp.id::text = o.customer_id
ORDER BY o.created_at DESC
LIMIT 1;
```

### 2. Numérotation ORD-XXX (robustesse en concurrence)
```sql
-- Test : Générer 10 numéros consécutivement
-- Vérifier que : 
-- ✅ Tous sont uniques
-- ✅ Pas de trous dans la séquence
-- ✅ Format correct (ORD-XXX avec padding)

SELECT public.generate_order_number() FROM generate_series(1, 10);
-- Résultat attendu : ORD-001, ORD-002, ..., ORD-010 (sans doublons)
```

### 3. Annulation de commande
```sql
-- Test : Annuler une commande
-- Vérifier que :
-- ✅ Le order_number est conservé (pas de réutilisation)
-- ✅ Une entrée dans order_status_history est créée
-- ✅ Un événement administratif est créé

INSERT INTO orders (customer_id, ...) VALUES (...);  -- Créer une commande
UPDATE orders SET status = 'ANNULEE' WHERE id = '...';  -- Annuler

-- Le numéro ne sera jamais réutilisé
SELECT order_number FROM orders WHERE status = 'ANNULEE';
```

### 4. Affectation chauffeur
```sql
-- Test : Affecter un chauffeur à une commande
-- Vérifier que :
-- ✅ assigned_driver_id est mis à jour
-- ✅ Un événement d'affectation est créé
-- ✅ Le chauffeur peut voir la commande (RLS)
-- ✅ Une notification est envoyée au chauffeur

SELECT 
  o.order_number,
  o.assigned_driver_id,
  d.name as driver_name,
  (SELECT COUNT(*) FROM order_assignment_events WHERE order_id = o.id) as events_count,
  (SELECT COUNT(*) FROM notifications WHERE order_id = o.id AND channel = 'DRIVER') as notif_count
FROM orders o
LEFT JOIN drivers d ON d.id = o.assigned_driver_id
WHERE o.assigned_driver_id IS NOT NULL
LIMIT 5;
```

### 5. Facture mensuelle
```sql
-- Test : Générer une facture pour un client pour le mois en cours
-- Vérifier que :
-- ✅ La facture agrège bien toutes les commandes du mois
-- ✅ Les montants HT/TTC sont corrects
-- ✅ Le statut est EN_ATTENTE
-- ✅ Les commandes ont invoice_id mis à jour

SELECT 
  i.invoice_number,
  i.period_start,
  i.period_end,
  i.amount_ht,
  i.amount_ttc,
  i.status,
  COUNT(o.id) as orders_in_invoice
FROM invoices i
LEFT JOIN orders o ON o.invoice_id = i.id
GROUP BY i.id
ORDER BY i.created_at DESC
LIMIT 5;
```

### 6. Dashboard admin (Vue d'ensemble)
```sql
-- Test : Vérifier que le dashboard affiche les bonnes stats
-- Vérifier que :
-- ✅ Commandes du mois : nombre correct
-- ✅ CA du mois : somme correcte des amounts
-- ✅ Courses en cours : compte EN_COURS + ENLEVE
-- ✅ Nouveaux clients : compte les créations du mois

-- Commandes du mois
SELECT COUNT(*) 
FROM orders 
WHERE date_trunc('month', schedule_start) = date_trunc('month', now())
  AND status != 'ANNULEE';

-- CA du mois
SELECT SUM(amount) 
FROM orders 
WHERE date_trunc('month', schedule_start) = date_trunc('month', now())
  AND status != 'ANNULEE';

-- Courses en cours
SELECT COUNT(*) 
FROM orders 
WHERE status IN ('EN_COURS', 'ENLEVE');

-- Nouveaux clients du mois
SELECT COUNT(*) 
FROM client_profiles 
WHERE date_trunc('month', created_at) = date_trunc('month', now());
```

### 7. RLS (Row Level Security)
```sql
-- Test : Vérifier que les politiques RLS fonctionnent
-- Se connecter avec différents rôles et vérifier les accès

-- ADMIN : peut tout voir
SET request.jwt.claims = '{"sub": "admin-user-id", "role": "admin"}';
SELECT COUNT(*) FROM orders;  -- Doit voir TOUTES les commandes

-- CLIENT : ne voit que ses commandes
SET request.jwt.claims = '{"sub": "client-user-id", "role": "client"}';
SELECT COUNT(*) FROM orders;  -- Doit voir UNIQUEMENT ses commandes

-- CHAUFFEUR : ne voit que ses commandes assignées
SET request.jwt.claims = '{"sub": "driver-user-id", "role": "chauffeur"}';
SELECT COUNT(*) FROM orders WHERE assigned_driver_id = (SELECT id FROM drivers WHERE user_id = 'driver-user-id');
```

## 🔄 Migration rollback (si nécessaire)

```sql
-- EN CAS DE PROBLÈME : Script de rollback complet
-- ⚠️ ATTENTION : Ceci supprimera TOUTES les données

-- Supprimer les vues
DROP VIEW IF EXISTS public.monthly_stats CASCADE;
DROP VIEW IF EXISTS public.active_orders CASCADE;
DROP VIEW IF EXISTS public.new_clients_monthly CASCADE;

-- Supprimer les tables (ordre important pour respecter les FK)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.conversation_messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.order_administrative_events CASCADE;
DROP TABLE IF EXISTS public.order_assignment_events CASCADE;
DROP TABLE IF EXISTS public.order_status_history CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.driver_unavailabilities CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.client_profiles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_client_orders_count() CASCADE;
DROP FUNCTION IF EXISTS public.create_initial_status_history() CASCADE;
DROP FUNCTION IF EXISTS public.set_order_number() CASCADE;

-- Supprimer la séquence
DROP SEQUENCE IF EXISTS public.order_number_seq CASCADE;

-- Supprimer les types enum
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.assignment_event_type CASCADE;
DROP TYPE IF EXISTS public.driver_status CASCADE;
DROP TYPE IF EXISTS public.driver_unavailability_type CASCADE;
DROP TYPE IF EXISTS public.invoice_status CASCADE;
DROP TYPE IF EXISTS public.conversation_entity_type CASCADE;
DROP TYPE IF EXISTS public.conversation_category CASCADE;
DROP TYPE IF EXISTS public.conversation_sender CASCADE;
DROP TYPE IF EXISTS public.notification_channel CASCADE;
```

## 🔗 Liens utiles

- [Dashboard Supabase](https://supabase.com/dashboard/project/onptfjkvnmrshsdspqlm)
- [SQL Editor](https://supabase.com/dashboard/project/onptfjkvnmrshsdspqlm/sql/new)
- [Table Editor](https://supabase.com/dashboard/project/onptfjkvnmrshsdspqlm/editor)
- [Authentication](https://supabase.com/dashboard/project/onptfjkvnmrshsdspqlm/auth/users)
- [API Docs (auto-générée)](https://supabase.com/dashboard/project/onptfjkvnmrshsdspqlm/api)

## 📞 Support

En cas de problème :
1. Consulter les logs Supabase : [Logs](https://supabase.com/dashboard/project/onptfjkvnmrshsdspqlm/logs/postgres-logs)
2. Vérifier les politiques RLS : [RLS Policies](https://supabase.com/dashboard/project/onptfjkvnmrshsdspqlm/auth/policies)
3. Tester les requêtes SQL dans l'éditeur SQL

---

**✅ Migration terminée avec succès !** L'infrastructure Supabase est maintenant prête pour le déploiement en production.
