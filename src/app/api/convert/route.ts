import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs-extra';
import { nanoid } from 'nanoid'

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const fileId = nanoid();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // tmp 디렉토리 생성 및 파일 저장
    const tmpDir = path.join(process.cwd(), 'tmp', fileId);
    await fs.ensureDir(tmpDir);
    const inputPath = path.join(tmpDir, file.name);
    const outputPath = path.join(tmpDir, `${file.name}.ts`);

    await fs.writeFile(inputPath, buffer);

    // Execute openapi-typescript
    await execAsync(`npx openapi-typescript ${inputPath} -o ${outputPath}`);

    // TypeScript 파일 읽기
    const tsContent = await fs.readFile(outputPath, 'utf-8');

    // 제거 하기
    await fs.remove(path.join(tmpDir));

    return NextResponse.json({
      content: tsContent,
      filename: `${file.name}.ts`
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}