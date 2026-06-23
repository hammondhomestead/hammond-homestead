# Hammond Homestead — Setup Instructions
## hammond-homestead.com

---

## STEP 1 — Upload Your Logo

Put your logo file in the `images/` folder named `logo.png`.
If you don't have it as a PNG, rename the file to `logo.png`.

---

## STEP 2 — Create a Supabase Account (Free Database)

1. Go to **supabase.com** and click "Start your project"
2. Sign up with GitHub or email
3. Click "New project" — name it `hammond-homestead`
4. Choose a strong password and save it
5. Wait ~2 minutes for it to set up

### Create the database tables:
In Supabase, click **SQL Editor** and paste this, then click Run:

```sql
-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  badge text,
  stock integer,
  created_at timestamp with time zone default now()
);

-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  payment_intent_id text,
  customer_name text,
  customer_email text,
  address text,
  items jsonb,
  subtotal decimal(10,2),
  shipping decimal(10,2),
  total decimal(10,2),
  status text default 'paid',
  payment_method text default 'stripe',
  created_at timestamp with time zone default now()
);

-- Allow public to read products
alter table products enable row level security;
create policy "Products are public" on products for select using (true);

-- Allow public to insert orders
alter table orders enable row level security;
create policy "Anyone can create orders" on orders for insert with check (true);

-- Admins can do everything (authenticated users)
create policy "Admins manage products" on products for all using (auth.role() = 'authenticated');
create policy "Admins view orders" on orders for select using (auth.role() = 'authenticated');
```

### Create a storage bucket for product images:
1. In Supabase, go to **Storage**
2. Click "New bucket" — name it `products`
3. Check "Public bucket" — click Create

### Get your Supabase keys:
1. Go to **Settings > API**
2. Copy "Project URL" — this is your SUPABASE_URL
3. Copy "anon public" key — this is your SUPABASE_KEY

### Create admin login:
1. Go to **Authentication > Users**
2. Click "Invite user" or "Add user"
3. Enter Hammond's email and a strong password
4. This is what he'll use to log into /admin/

---

## STEP 3 — Create a Stripe Account

1. Go to **stripe.com** and sign up
2. Fill in Hammond's business info
3. Go to **Developers > API Keys**
4. Copy the **Publishable key** (starts with `pk_live_` or `pk_test_`)

### Create a Supabase Edge Function for payments:
In Supabase, go to **Edge Functions > New Function** named `create-payment-intent`

Paste this code:
```javascript
import Stripe from 'https://esm.sh/stripe@13?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))

Deno.serve(async (req) => {
  const { amount, currency, customer_email } = await req.json()
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    receipt_email: customer_email,
    automatic_payment_methods: { enabled: true }
  })
  
  return new Response(
    JSON.stringify({ client_secret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

Then in Supabase go to **Settings > Edge Functions** and add secret:
- Name: `STRIPE_SECRET_KEY`
- Value: Your Stripe secret key (starts with `sk_`)

---

## STEP 4 — Create a PayPal Business Account

1. Go to **paypal.com/business**
2. Sign up for a Business account
3. Go to **developer.paypal.com**
4. Click **Apps & Credentials**
5. Click "Create App" — name it Hammond Homestead
6. Copy the **Client ID**

---

## STEP 5 — Add Your Keys to the Code

Open `js/app.js` and replace:
```
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const STRIPE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY';
```

Open `checkout.html` and replace:
```
client-id=YOUR_PAYPAL_CLIENT_ID
```

---

## STEP 6 — Deploy to Vercel (Free Hosting)

1. Go to **github.com** and create a free account
2. Click "New repository" — name it `hammond-homestead` — click Create
3. Upload all the site files to the repository
4. Go to **vercel.com** and sign up with your GitHub account
5. Click "New Project" — import `hammond-homestead`
6. Click Deploy — done!

Your site will be live at `hammond-homestead.vercel.app` within 2 minutes.

---

## STEP 7 — Connect hammond-homestead.com

1. In Vercel, go to your project > **Settings > Domains**
2. Add `hammond-homestead.com`
3. Vercel gives you nameservers (e.g. `ns1.vercel-dns.com`)
4. Log into GoDaddy, go to your domain > **DNS > Nameservers**
5. Switch to "Custom" and enter Vercel's nameservers
6. Wait 1–48 hours — your domain is live!

---

## STEP 8 — Log Into Admin

Go to `hammond-homestead.com/admin/`

Log in with the email and password you set up in Supabase.

From there Hammond can:
- Add products with photos, names, descriptions, and prices
- See all orders
- Track revenue

---

## NEED HELP?

Come back to Claude and share any error messages — we can fix anything together.
