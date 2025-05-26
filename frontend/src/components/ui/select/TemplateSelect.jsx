import { CreatableSelect } from 'chakra-react-select'

const TemplateSelect = ({ templates, selectedTemplate, setSelectedTemplate, isNewTemplate }) => {
  return (
    <CreatableSelect
      name="folder"
      minWidth="300px"
      placeholder="폴더 선택 또는 입력"
      options={templates?.map((folder) => ({
        value: folder.title,
        label: folder.title,
        folderId: folder.folderId,
      }))}
      value={
        selectedTemplate?.folderName
          ? {
              value: selectedTemplate.folderName,
              label: selectedTemplate.folderName,
            }
          : isNewTemplate
          ? null
          : {
              value: templates[0].title,
              label: templates[0].title,
            }
      }
      onChange={(newValue) => {
        selectedTemplate &&
          setSelectedTemplate({
            ...selectedTemplate,
            folderName: newValue.value,
            folderId: newValue.folderId,
          })
      }}
      onCreateOption={(inputValue) => {
        const newfolder = inputValue
        selectedTemplate &&
          setSelectedTemplate({
            ...selectedTemplate,
            folderName: newfolder,
            folderId: null,
          })
      }}
      isClearable={false}
      isDisabled={!isNewTemplate && !selectedTemplate}
      chakraStyles={{
        container: (provided) => ({
          ...provided,
          minWidth: '300px',
        }),
      }}
    />
  )
}

export default TemplateSelect
