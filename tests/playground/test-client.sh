# Prepare folder for client tests
echo "Preparing client tests..."
rm -Rf tests/playground/test-client && cp -R tests/playground/example tests/playground/test-client
cd tests/playground/test-client
#npm install
PMT_TEST=true npx prisma4-multi-tenant init --provider=sqlite --url=file:management.db --silent=true
#npm link prisma4-multi-tenant
npx prisma4-multi-tenant new --name=test1 --provider=sqlite --url=file:dev1.db --silent=true
cp -R ../../client/ tests/
echo "Running client tests..."
npm install --save-dev jest @types/jest ts-jest @babel/plugin-transform-modules-commonjs &>/dev/null
npm run test