const LoginForm = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          onLoginSuccess();
        } else {
          setError('Credenciales inválidas');
        }
      } catch (error) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Veterinaria
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={credentials.email}
                onChange={e => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={credentials.password}
                onChange={e => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  export default LoginForm;