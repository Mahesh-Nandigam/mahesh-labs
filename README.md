# MaheshLabs

Podcast website, blog, newsletter signup, and password-protected Studio.

```sh
npm install
npm run db:migrate
npm run db:seed
npm run admin:password
npm run dev
```

Open http://localhost:4173. Studio: `/admin/`.

Neon provides `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in `.env.local`. The password command stores a hash there. Configure the same values on your hosting provider.

```sh
npm run check
npm run build
npm start
```

Requires Node.js 20.9+ and a Next.js server host. This app no longer uses a static export. Email delivery and subscriber early access are planned separately.
