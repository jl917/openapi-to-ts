'use client';

import { Upload, Button, message, Typography, Layout } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { useState } from 'react';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function Home() {
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file: RcFile) => {
    const isYamlOrJson = file.type === 'application/json' ||
      file.name.endsWith('.yaml') ||
      file.name.endsWith('.yml');

    if (!isYamlOrJson) {
      message.error('You can only upload YAML or JSON files!');
      return false;
    }
    return true;
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Create and download the TypeScript file
      const blob = new Blob([data.content], { type: 'text/typescript' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onSuccess('Ok');
      message.success('Conversion successful!');
    } catch (err) {
      onError({ err });
      message.error('Conversion failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2}>OpenAPI to TypeScript Converter</Title>
          <Text type="secondary">
            Upload your OpenAPI YAML or JSON file to convert it to TypeScript
          </Text>
        </div>

        <Upload
          customRequest={handleUpload}
          beforeUpload={beforeUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            Click to Upload
          </Button>
        </Upload>
      </Content>
    </Layout>
  );
}
