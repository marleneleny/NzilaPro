// services/cloudinary.js
const CLOUDINARY_CLOUD_NAME = "dxbzvohmh"; // Seu cloud name
const CLOUDINARY_UPLOAD_PRESET = "nzilaPro_uploads"; // Seu upload preset

// Configuração da URL base do Cloudinary
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

// Função para upload de imagens
export const uploadImage = async (file, userId = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Adicionar pasta personalizada se userId fornecido
    if (userId) {
      formData.append('folder', `users/${userId}/images`);
    }
    
    // Transformações para otimizar imagens
    formData.append('transformation', 'c_fill,w_400,h_400,q_auto');

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      originalName: file.name,
      size: file.size,
      format: data.format
    };
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    throw new Error(`Falha no upload da imagem: ${error.message}`);
  }
};

// Função para upload de documentos (CVs)
export const uploadDocument = async (file, userId = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'raw'); // Importante para documentos
    
    // Adicionar pasta personalizada se userId fornecido
    if (userId) {
      formData.append('folder', `users/${userId}/documents`);
    }

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      originalName: file.name,
      size: file.size,
      format: data.format
    };
  } catch (error) {
    console.error('Erro no upload do documento:', error);
    throw new Error(`Falha no upload do documento: ${error.message}`);
  }
};

// SOLUÇÃO TEMPORÁRIA: Função que simula a exclusão
// Na realidade, apenas remove do estado local e localStorage
export const deleteDocument = async (publicId) => {
  try {
    console.log('Simulando exclusão do documento com publicId:', publicId);
    
    // IMPORTANTE: Esta é uma simulação porque a exclusão real do Cloudinary
    // requer API Key e Secret que devem estar no backend
    
    // Simular delay de requisição
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retornar sucesso simulado
    return {
      result: 'ok',
      message: 'Documento removido do sistema (arquivo permanece no Cloudinary até limpeza manual)'
    };
  } catch (error) {
    console.error('Erro ao simular exclusão do documento:', error);
    throw error;
  }
};

// FUNÇÃO PARA BACKEND: Esta função deve ser implementada no seu servidor
// Exemplo de como seria no backend (Node.js)
/*
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dxbzvohmh',
  api_key: 'YOUR_API_KEY',
  api_secret: 'YOUR_API_SECRET'
});

const deleteDocumentFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    return result;
  } catch (error) {
    throw error;
  }
};
*/

// Função para requisitar exclusão via backend (quando implementado)
export const deleteDocumentViaBackend = async (publicId) => {
  try {
    const response = await fetch('/api/delete-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        publicId: publicId
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar documento do Cloudinary');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao deletar documento via backend:', error);
    throw error;
  }
};

// Função helper para gerar URLs de transformação
export const getTransformedImageUrl = (publicId, transformations = '') => {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};

// Função para validar tipos de arquivo
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Função para validar tamanho do arquivo
export const validateFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Função para limpar cache do Cloudinary (útil para desenvolvimento)
export const bustCloudinaryCache = (url) => {
  const timestamp = Date.now();
  return url.includes('?') ? `${url}&cb=${timestamp}` : `${url}?cb=${timestamp}`;
};