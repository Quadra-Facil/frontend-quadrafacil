
import Select from "react-select";

// Tipagem para as props
interface SelectSearchStatusProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

export default function SelectSearchStatus({
  currentStatus,
  onStatusChange,
}: SelectSearchStatusProps) {

  // Função chamada quando o valor do select muda
  const handleChange = (selectedOption: { value: string; label: string } | null): void => {
    // Verifica se o valor da opção selecionada não é nulo antes de passar
    if (selectedOption) {
      onStatusChange(selectedOption.value);
    }
  };

  // Opções do select
  const optionsStatus = [
    { value: 'teste', label: 'Teste' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
  ];

  return (
    <>
      <Select
        value={optionsStatus.find(option => option.value === currentStatus) || null} // Aqui garantimos que o valor esteja no formato correto
        onChange={handleChange} // Passa a função handleChange
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: state.isFocused ? 'none' : 'none', // Retira borda ao focar
            border: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#dfdfdf',
            color: '#878282',
            padding: '0 12px',
            borderRadius: '10px',
            fontSize: '14px',
          }),
          option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isFocused ? '#f7cebe' : '#fff',
            color: '#878282',
            padding: '12px 20px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '14px',
          }),
        }}
        options={optionsStatus}
        placeholder="Status"
        className="arena-select"
      />
    </>
  );
}
