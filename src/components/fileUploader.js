export async function uploadFile(name, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
   
    try {
        const response = await fetch('https://file-upload-server-mc26.onrender.com', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка загрузки файла');
        }

        return data;
    } catch (error) {
        throw new Error(error.message || 'Произошла ошибка при отправке данных');
    }
}
