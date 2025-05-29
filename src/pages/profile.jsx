import React, { useState, useRef } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../services/firebase"; // Caminho corrigido
import defaultImage from "../assets/default.svg";
import useAuth from "../hooks/useAuth";
import Navbar from "../componentes/Navbar"
import NzilaFooter from "../componentes/NzilaFooter"
import topoProfile from "../assets/topoProfile.svg"

export default function Profile() {
  const { User, SetUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: User?.name || User?.displayName || "",
    email: User?.email || "",
    area: User?.area || "",
    accountType: User?.accountType || "",
    contact: User?.contact || "",
    about: User?.about || "",
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); // Loading específico para imagem
  const [previewImage, setPreviewImage] = useState(null); // Para preview da imagem
  const fileInputRef = useRef(null);

  const defaultAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4zm0 9c2.67 0 8 1.34 8 4v1H4v-1c0-2.66 5.33-4 8-4z'/%3E%3C/svg%3E";

  const getUserAvatar = () => {
    // Se há uma imagem de preview, use ela primeiro
    if (previewImage) return previewImage;
    
    if (User) {
      // First check for custom avatar, then Google photo
      if (User.avatar) return User.avatar;
      if (User.photoURL) return User.photoURL;
    }
    // Return default avatar if no user or no photo
    return defaultAvatar;
  };

  const isAuthenticated = () => {
    return User && User.uid;
  };

  const handleClickImage = () => {
    if (!imageLoading) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Criar preview imediato da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    if (!User?.id && !User?.uid) {
      alert("Usuário não autenticado");
      return;
    }

    setImageLoading(true);

    try {
      // Criar referência para o storage
      const userId = User.id || User.uid;
      const imageRef = ref(storage, `avatars/${userId}/${Date.now()}_${file.name}`);
      
      // Upload da imagem
      console.log("Uploading image...");
      const snapshot = await uploadBytes(imageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Image uploaded successfully:", downloadURL);
      
      // Atualizar no Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        avatar: downloadURL
      });
      
      // Atualizar contexto do usuário
      SetUser((prev) => ({
        ...prev,
        avatar: downloadURL
      }));
      
      // Limpar preview pois agora temos a URL definitiva
      setPreviewImage(null);
      
      console.log("Avatar updated successfully");
      alert("Foto de perfil atualizada com sucesso!");
      
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao fazer upload da imagem. Tente novamente.");
      // Se houve erro, manter o preview
    } finally {
      setImageLoading(false);
      // Limpar o input para permitir upload da mesma imagem novamente se necessário
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!User?.id && !User?.uid) {
      alert("Usuário não autenticado");
      return;
    }

    setLoading(true);

    try {
      const userId = User.id || User.uid;
      // Update user document in Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        email: formData.email,
        area: formData.area,
        accountType: formData.accountType,
        contact: formData.contact,
        about: formData.about,
      });

      // Update user context
      SetUser((prev) => ({
        ...prev,
        name: formData.fullName,
        email: formData.email,
        area: formData.area,
        accountType: formData.accountType,
        contact: formData.contact,
        about: formData.about,
      }));

      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    setFormData({
      fullName: User?.name || User?.displayName || "",
      email: User?.email || "",
      area: User?.area || "",
      accountType: User?.accountType || "Profissional",
      contact: User?.contact || "",
      about: User?.about || "",
    });
    // Limpar preview da imagem também
    setPreviewImage(null);
  };

  return (
    <div className="min-h-screen bg-[#060B0D] text-white">
      <Navbar />

      <img className="pt-36 w-[200rem]" src={topoProfile} alt="" />
      
      <div className="flex flex-col items-center pt-20 pb-10">
        {/* Profile Image Section */}
        <div className="flex items-center gap-6  relative bottom-32">
          <div
            className={`w-36 h-36 bg-gray-600 right-[19rem] rounded-full overflow-hidden cursor-pointer relative ${
              imageLoading ? "opacity-50" : ""
            }`}
            onClick={handleClickImage}
            title={imageLoading ? "Carregando imagem..." : "Clique para trocar a foto"}
          >
            <img
              src={getUserAvatar()}
              alt={isAuthenticated() ? "User Avatar" : "Default Avatar"}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log("Image failed to load, using default");
                e.target.src = defaultAvatar;
              }}
              onLoad={() => console.log("Image loaded successfully")}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold right-[19rem] relative">
              {formData.fullName || "Nome do Usuário"}
            </h2>
          </div>
          <div className="flex gap-3 absolute ml-[23.2rem]">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-500 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-green-500 rounded-md text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              )}
              Salvar
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full max-w-4xl grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome completo
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Conta
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
              >
                <option value="Profissional">Profissional</option>
                <option value="Estudante">Estudante</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Área de atuação
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
              >
                <option value="Tecnologia">Marketing Digital</option>
                <option value="Educação">Educação</option>
                <option value="Contabilidade">Contabilidade</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contacto</label>
              <div className="flex">
                <span className="px-3 py-3 bg-gray-700 border border-r-0 border-gray-600 rounded-l-md text-sm">
                  +244
                </span>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-r-md focus:outline-none focus:border-green-500"
                  placeholder="9********"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CV Upload Section */}
        <div className="w-full max-w-4xl mt-8">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v1.586l.293.293a1 1 0 001.414 0L6 4.586V19a2 2 0 002 2h8a2 2 0 002-2V4.586l2.293 2.293a1 1 0 001.414-1.414L14.414 1.586A2 2 0 0013 1H7a2 2 0 00-1.414.586L.293 6.879a1 1 0 001.414 1.414L4 6.586V5a2 2 0 012-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-300">
              <span className="font-medium">Clica para carregar</span> o seu
              Currículo na plataforma
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="w-full max-w-4xl mt-8">
          <label className="block text-sm font-medium mb-2">Sobre mim</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            rows="6"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-green-500 resize-none"
            placeholder="Fale um pouco sobre você..."
          />
        </div>

        {/* Logout Button */}
        <div className="w-full max-w-4xl mt-8">
          <button className="px-6 py-2 bg-green-500 rounded-md text-black font-medium hover:bg-green-400">
            Terminar sessão
          </button>
        </div>
      </div>

      <NzilaFooter/>
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
}