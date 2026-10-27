# RepoVitrin

Geliştirme aşamasındaki GitHub portfolyo sunumu değerlendirme projesi. Şu anda yalnız Next.js altyapısı ve geliştirme durumu sayfası var. Analiz, puanlama, TR/EN ürün arayüzü, veri saklama ve paylaşım henüz uygulanmadı. A1 başlamadı.

## Gereksinimler ve kurulum

Node.js **22.13.0** ve npm **10.9.2** ile doğrulanır; `.nvmrc` yerel ve CI Node sürümünü belirler. Sistem Node kurulumunu otomatik değiştiren bir betik yoktur. nvm kullanıyorsanız `nvm use` ile mevcut sürümü seçebilirsiniz.

```sh
npm ci
npm run dev
```

Başlangıç sayfası: http://localhost:3000

A0 için `.env.local` oluşturmak veya bir secret sağlamak gerekmez. `.env.example` gelecekte sunucuda kullanılacak `GITHUB_TOKEN`, `MONGODB_URI` ve `SIGNING_SECRET` isimlerini boş değerlerle belgeler. Bu aşamada okunmazlar. Gerçek değerler Git'e eklenmemeli; `NEXT_PUBLIC_` altında kullanılmamalıdır.

## Kontroller ve production çalıştırma

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

`typecheck`, temiz kurulumda önce `next typegen` ile Next.js tiplerini üretir, sonra TypeScript kontrolünü çalıştırır. `lint` ESLint CLI kullanır. `build` lint yerine geçmez. Test altyapısı ve `test` komutu henüz yoktur.

GitHub Actions, push ve pull request üzerinde `npm ci`, lint, typecheck ve build çalıştıracak şekilde tanımlıdır; uygulama secret'ı gerektirmez. Yerel kontrol sonuçları uzak CI sonucu değildir; güncel doğrulama durumu [STATUS](docs/STATUS.md) içindedir.

## Yapı

- `src/app`: App Router başlangıç sayfası, layout ve merkezi CSS tasarım tokenları.
- `src/config/site.ts`: çalışma markası ve geliştirici bağlantı bilgileri. Bilinmeyen Instagram adresi boştur.
- `docs`: ürün, mimari, puanlama, tasarım ve aşama kayıtları.

Tam paket sürümleri `package.json` ve `package-lock.json` içinde kilitlidir. Yalnız npm kullanılır. Çalışma kuralları [AGENTS.md](AGENTS.md), sıradaki işler [TASKS](docs/TASKS.md) içindedir.
