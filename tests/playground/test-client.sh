# Prepare folder for client tests
rm -Rf tests/playground/test-client && cp -R tests/playground/example tests/playground/test-client
cd tests/playground/test-client
#yarn i
PMT_TEST=true npx prisma4-multi-tenant init --provider=sqlite --url=file:management.db
#npm link prisma4-multi-tenant
npx prisma4-multi-tenant new --name=test1 --provider=sqlite --url=file:dev1.db
cp -R ../../client/ tests/
cp -R ../../../jest.config.js .
PMT_TEST=true jest tests/constructor.test.ts --runInBand --detectOpenHandles --forceExit
PMT_TEST=true jest tests/create.test.ts --runInBand --detectOpenHandles --forceExit
PMT_TEST=true jest tests/delete.test.ts --runInBand --detectOpenHandles --forceExit
PMT_TEST=true jest tests/exists.test.ts --runInBand --detectOpenHandles --forceExit
PMT_TEST=true jest tests/get.test.ts --runInBand --detectOpenHandles --forceExit
PMT_TEST=true jest tests/migrate.test.ts --runInBand --detectOpenHandles --forceExit