cd tests\playground
rd /s /q test-client
xcopy /y /e example test-client\
cd test-client
cmd /c npm i
SET PMT_TEST=true
cmd /c npm link prisma2-multi-tenant
cmd /c npx prisma2-multi-tenant init --provider=sqlite --url=file:management.db
cmd /c npx prisma2-multi-tenant new --name=test1 --provider=sqlite --url=file:dev1.db
xcopy /y /e ..\..\client\ tests\
copy /y ..\..\..\jest.config.js .
set PMT_TEST=true 
cmd /c npx jest tests\
