import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Avaliacao = () => {
  const { disableItem, isItemDisabled } = useContext(AuthContext);
  const [avaliacaoFinalizada, setAvaliacaoFinalizada] = useState(false);
  
  const handleFinalizarAvaliacao = () => {
    // Sua lógica de avaliação aqui
    console.log('Finalizando avaliação...');
    
    // Simular processo de avaliação
    setAvaliacaoFinalizada(true);
    
    // Desabilita o acesso às candidaturas
    disableItem('candidaturas-nav');
    
    alert('Avaliação finalizada com sucesso! As candidaturas foram desabilitadas.');
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Avaliação do Sistema</h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Instruções</h3>
        <p>Complete sua avaliação abaixo. Após finalizar, o acesso às candidaturas será temporariamente desabilitado.</p>
      </div>
      
      {!avaliacaoFinalizada ? (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Questões da Avaliação</h4>
            <div style={{ marginBottom: '15px' }}>
              <label>Como você avalia o sistema?</label>
              <select style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                <option>Excelente</option>
                <option>Bom</option>
                <option>Regular</option>
                <option>Ruim</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Comentários adicionais:</label>
              <textarea 
                style={{ 
                  width: '100%', 
                  height: '100px', 
                  padding: '8px', 
                  marginTop: '5px',
                  resize: 'vertical'
                }}
                placeholder="Deixe seus comentários aqui..."
              />
            </div>
          </div>
          
          <button 
            onClick={handleFinalizarAvaliacao}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Finalizar Avaliação
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '6px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#0c5460' }}>✅ Avaliação Finalizada</h3>
          <p style={{ color: '#0c5460' }}>Obrigado pela sua avaliação! As candidaturas foram desabilitadas.</p>
        </div>
      )}
      
      {/* Status atual */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '6px' 
      }}>
        <h4 style={{ color: '#856404', marginBottom: '10px' }}>Status do Sistema:</h4>
        <p style={{ color: '#856404', margin: 0 }}>
          Candidaturas: {isItemDisabled('candidaturas-nav') ? '🚫 Desabilitadas' : '✅ Habilitadas'}
        </p>
      </div>
    </div>
  );
};

export default Avaliacao;