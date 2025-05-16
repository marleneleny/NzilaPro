
import defaultImage from "../assets/default.svg";
const { User, SetUser } = useAuth();
  const [preview, setPreview] = useState(User?.avatar || defaultImage);
  const fileInputRef = useRef(null); // Referência para o input escondido

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result); // mostrar a nova imagem
        SetUser((prev) => ({ ...prev, avatar: reader.result })); // atualizar o avatar global
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClickImage = () => {
    fileInputRef.current.click(); // abre o seletor de arquivos ao clicar na imagem
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-32 h-32 bg-slate-400 rounded-full overflow-hidden shadow-md border cursor-pointer"
        onClick={handleClickImage}
        title="Clique para trocar a foto"
      >
        <img
          src={defaultImage}
          alt="Foto de perfil"
          className="w-full h-full object-cover"
        />
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );


