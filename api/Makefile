dev:
	npm run dev

build:
	npm run build

migrate:
	npx prisma migrate dev

migrate-prod:
	npx prisma migrate deploy

generate:
	npx prisma generate

seed:
	npx tsx prisma/seed/index.ts

studio:
	npx prisma studio

typecheck:
	npm run typecheck

test:
	npm test

deploy:
	npm run build && npx prisma migrate deploy && npx prisma generate
