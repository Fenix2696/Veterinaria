const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password
      })
    };

    const response = await fetch(`${API_URL}/auth/login`, fetchOptions);
    const data = await response.json();
    
    // Debug logs
    console.log('Respuesta completa:', {
      status: response.status,
      data: data
    });

    if (!response.ok) {
      throw new Error(data.message || 'Error de autenticación');
    }

    if (!data.success || !data.data?.token) {
      throw new Error('Error en la autenticación: Token no recibido');
    }

    // Guardar el token
    localStorage.setItem('token', data.data.token);
    console.log('Token almacenado exitosamente');
    onLoginSuccess();

  } catch (error) {
    console.error('Error en login:', error);
    setError(error.message || 'Error durante el inicio de sesión');
  } finally {
    setLoading(false);
  }
};