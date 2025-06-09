// Adicionar estas funções de debug no seu cloudinary.js

// Função para testar a conexão com o Cloudinary
export const testCloudinaryConnection = async () => {
  try {
    console.log("Testando conexão com Cloudinary...");
    
    // Teste simples com um arquivo pequeno em base64
    const testData = "data:text/plain;base64,SGVsbG8gV29ybGQ="; // "Hello World"
    
    const result = await fetch(`https://api.cloudinary.com/v1_1/dxbzvohmh/raw/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: testData,
        upload_preset: 'nzilaPro_uploads',
        folder: 'test',
        resource_type: "raw"
      })
    });

    const data = await result.json();
    
    if (result.ok) {
      console.log("✅ Conexão com Cloudinary OK:", data);
      return { success: true, data };
    } else {
      console.error("❌ Erro na conexão com Cloudinary:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("❌ Erro de rede com Cloudinary:", error);
    return { success: false, error: error.message };
  }
};

// Função para validar upload preset
export const validateUploadPreset = async () => {
  try {
    console.log("Validando upload preset...");
    
    const result = await fetch(`https://api.cloudinary.com/v1_1/dxbzvohmh/upload_presets/nzilaPro_uploads`, {
      method: 'GET'
    });

    if (result.ok) {
      const data = await result.json();
      console.log("✅ Upload preset válido:", data);
      return { success: true, data };
    } else {
      console.error("❌ Upload preset inválido");
      return { success: false, error: "Upload preset não encontrado" };
    }
  } catch (error) {
    console.error("❌ Erro ao validar upload preset:", error);
    return { success: false, error: error.message };
  }
};

// Função de debug completa
export const debugCloudinary = async () => {
  console.log("🔍 Iniciando debug do Cloudinary...");
  
  // 1. Testar conexão básica
  const connectionTest = await testCloudinaryConnection();
  
  // 2. Validar upload preset
  const presetTest = await validateUploadPreset();
  
  // 3. Verificar configurações
  console.log("📋 Configurações atuais:");
  console.log("- Cloud Name: dxbzvohmh");
  console.log("- Upload Preset: nzilaPro_uploads");
  console.log("- API URL: https://api.cloudinary.com/v1_1/dxbzvohmh/");
  
  return {
    connection: connectionTest,
    preset: presetTest,
    timestamp: new Date().toISOString()
  };
};