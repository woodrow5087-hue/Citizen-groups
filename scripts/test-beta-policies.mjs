import {execFileSync} from 'node:child_process';import{readFileSync}from'node:fs';
// Read-only environment guard: this command can only execute inside our labelled test container.
const label=execFileSync('docker',['inspect','--format','{{index .Config.Labels "citizen.beta-test"}}','cg-v06-db'],{encoding:'utf8'}).trim();if(label!=='true')throw Error('Refusing to run against a non-test database.');
const sql=readFileSync('supabase/tests/security.sql','utf8');try{const output=execFileSync('docker',['exec','-i','cg-v06-db','psql','-U','postgres','-XAtq','-v','ON_ERROR_STOP=1'],{encoding:'utf8',input:sql,stdio:['pipe','pipe','pipe']});console.log(output.trim());}catch(e){console.error(e.stdout?.toString());console.error(e.stderr?.toString());process.exit(1);}
