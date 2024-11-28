import AsyncSelect from "react-select/async"

export default function SelectSearchUser() {

  //passar user todos
  const optionsStatus = [
    { value: 'teste', label: 'Teste' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
  ]

  return (
    <>
      <AsyncSelect
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: state.isFocused ? 'none' : 'none', // Retira borda ao focar
            border: 0,
            width: '100%',
            height: '100%',  // Define uma altura fixa do campo de entrada
            backgroundColor: '#dfdfdf',
            color: '#878282', // Cor do texto
            padding: '0 12px', // Aumenta o padding para evitar que o texto fique comprimido
            borderRadius: '10px', // Borda arredondada
            fontSize: '14px', // Tamanho de fonte mais confortável
          }),
          option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isFocused ? '#f7cebe' : '#fff', // Cor laranja para hover
            color: '#878282', // Cor do texto
            padding: '12px 20px', // Maior padding nas opções
            cursor: 'pointer',
            borderRadius: '4px', // Borda arredondada nas opções
            fontSize: '14px', // Tamanho de fonte adequado
          })
        }}
        options={optionsStatus}
        placeholder="Status"
        className="arena-select"
      />
    </>
  )
}