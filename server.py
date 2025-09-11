#!/usr/bin/env python3
"""
VibeWill Blog - Servidor Local com API
Servidor HTTP com API REST para gerenciar posts
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import json
import threading
import time
import urllib.parse
from pathlib import Path
from datetime import datetime

class BlogHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler customizado para o blog com API REST"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)
    
    def end_headers(self):
        # Headers CORS para desenvolvimento
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        
        # Headers de cache para desenvolvimento
        if self.path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        elif self.path.endswith('.json'):
            self.send_header('Cache-Control', 'no-cache')
            
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            self.send_response(405)
            self.end_headers()
    
    def do_PUT(self):
        """Handle PUT requests"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            self.send_response(405)
            self.end_headers()
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            self.send_response(405)
            self.end_headers()
    
    def handle_api_request(self):
        """Handle API requests"""
        try:
            # Parse URL
            parsed_path = urllib.parse.urlparse(self.path)
            path = parsed_path.path
            
            # Read request body if present
            content_length = int(self.headers.get('Content-Length', 0))
            body = {}
            if content_length > 0:
                body_raw = self.rfile.read(content_length).decode('utf-8')
                try:
                    body = json.loads(body_raw)
                except json.JSONDecodeError:
                    body = {}
            
            # Route API requests
            if path == '/api/posts':
                if self.command == 'GET':
                    self.get_posts()
                elif self.command == 'POST':
                    self.create_post(body)
                else:
                    self.send_error_response(405, "Method not allowed")
            
            elif path.startswith('/api/posts/'):
                post_id = path.split('/')[-1]
                if self.command == 'PUT':
                    self.update_post(post_id, body)
                elif self.command == 'DELETE':
                    self.delete_post(post_id)
                else:
                    self.send_error_response(405, "Method not allowed")
            
            else:
                self.send_error_response(404, "API endpoint not found")
                
        except Exception as e:
            print(f"❌ API Error: {e}")
            self.send_error_response(500, f"Internal server error: {str(e)}")
    
    def get_posts(self):
        """Get all posts"""
        try:
            posts = self.load_posts()
            self.send_json_response(posts)
            print(f"📖 {len(posts)} posts enviados para o cliente")
        except Exception as e:
            self.send_error_response(500, f"Error loading posts: {str(e)}")
    
    def create_post(self, post_data):
        """Create new post"""
        try:
            posts = self.load_posts()
            
            # Generate new ID
            max_id = max([post.get('id', 0) for post in posts], default=0)
            new_id = max_id + 1
            
            # Create new post
            new_post = {
                'id': new_id,
                'title': post_data.get('title', ''),
                'excerpt': post_data.get('excerpt', ''),
                'content': post_data.get('content', ''),
                'category': post_data.get('category', ''),
                'tags': post_data.get('tags', []),
                'image': post_data.get('image', 'fas fa-rocket'),
                'featured': post_data.get('featured', False),
                'status': post_data.get('status', 'published'),
                'author': post_data.get('author', 'VibeWill'),
                'date': datetime.now().strftime('%Y-%m-%d'),
                'createdAt': datetime.now().isoformat() + 'Z',
                'updatedAt': datetime.now().isoformat() + 'Z'
            }
            
            # Add to beginning of posts list
            posts.insert(0, new_post)
            
            # Save posts
            self.save_posts(posts)
            
            self.send_json_response({'success': True, 'post': new_post})
            print(f"✅ Post criado: '{new_post['title']}' (ID: {new_id})")
            
        except Exception as e:
            print(f"❌ Erro ao criar post: {e}")
            self.send_error_response(500, f"Error creating post: {str(e)}")
    
    def update_post(self, post_id, post_data):
        """Update existing post"""
        try:
            posts = self.load_posts()
            
            # Find post
            post_index = -1
            for i, post in enumerate(posts):
                if str(post.get('id')) == str(post_id):
                    post_index = i
                    break
            
            if post_index == -1:
                self.send_error_response(404, "Post not found")
                return
            
            # Update post
            existing_post = posts[post_index]
            updated_post = {
                **existing_post,
                'title': post_data.get('title', existing_post.get('title')),
                'excerpt': post_data.get('excerpt', existing_post.get('excerpt')),
                'content': post_data.get('content', existing_post.get('content')),
                'category': post_data.get('category', existing_post.get('category')),
                'tags': post_data.get('tags', existing_post.get('tags')),
                'image': post_data.get('image', existing_post.get('image')),
                'featured': post_data.get('featured', existing_post.get('featured')),
                'status': post_data.get('status', existing_post.get('status')),
                'updatedAt': datetime.now().isoformat() + 'Z'
            }
            
            posts[post_index] = updated_post
            
            # Save posts
            self.save_posts(posts)
            
            self.send_json_response({'success': True, 'post': updated_post})
            print(f"✅ Post atualizado: '{updated_post['title']}' (ID: {post_id})")
            
        except Exception as e:
            print(f"❌ Erro ao atualizar post: {e}")
            self.send_error_response(500, f"Error updating post: {str(e)}")
    
    def delete_post(self, post_id):
        """Delete post"""
        try:
            posts = self.load_posts()
            
            # Find post title for logging
            post_title = "Desconhecido"
            for post in posts:
                if str(post.get('id')) == str(post_id):
                    post_title = post.get('title', 'Sem título')
                    break
            
            # Find and remove post
            original_length = len(posts)
            posts = [post for post in posts if str(post.get('id')) != str(post_id)]
            
            if len(posts) == original_length:
                self.send_error_response(404, "Post not found")
                return
            
            # Save posts
            self.save_posts(posts)
            
            self.send_json_response({'success': True})
            print(f"🗑️  Post deletado: '{post_title}' (ID: {post_id})")
            
        except Exception as e:
            print(f"❌ Erro ao deletar post: {e}")
            self.send_error_response(500, f"Error deleting post: {str(e)}")
    
    def load_posts(self):
        """Load posts from JSON file"""
        posts_file = 'data/posts.json'
        try:
            with open(posts_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print("📄 Arquivo posts.json não encontrado, criando com posts padrão")
            default_posts = self.get_default_posts()
            self.save_posts(default_posts)
            return default_posts
        except json.JSONDecodeError:
            print(f"⚠️  Arquivo {posts_file} corrompido, usando posts padrão")
            return self.get_default_posts()
    
    def get_default_posts(self):
        """Get default posts for initialization"""
        return [
            {
                "id": 1,
                "title": "Bem-vindo ao VibeWill Blog!",
                "excerpt": "Este é o primeiro post do nosso blog. Aqui você encontrará conteúdos incríveis sobre tecnologia, lifestyle e muito mais.",
                "content": "<p>Bem-vindo ao <strong>VibeWill Blog</strong>! Este é um espaço dedicado a compartilhar conhecimento, experiências e insights sobre diversos temas que podem enriquecer sua vida pessoal e profissional.</p><p>Nossa missão é criar conteúdos de qualidade que possam inspirar, educar e conectar pessoas. Aqui você encontrará artigos sobre:</p><ul><li><strong>Tecnologia:</strong> As últimas novidades do mundo tech, tutoriais e dicas práticas</li><li><strong>Design:</strong> Tendências, técnicas e inspirações para criar projetos incríveis</li><li><strong>Lifestyle:</strong> Dicas para melhorar sua qualidade de vida e produtividade</li></ul><p>Estamos muito empolgados com esta jornada e esperamos que você nos acompanhe nesta aventura. Não esqueça de se inscrever na nossa newsletter para receber as novidades direto no seu e-mail!</p><p>Obrigado por fazer parte da comunidade VibeWill! 🚀</p>",
                "category": "tecnologia",
                "date": "2024-01-15",
                "author": "VibeWill",
                "image": "fas fa-rocket",
                "status": "published",
                "featured": True,
                "tags": ["bem-vindo", "blog", "comunidade"],
                "createdAt": "2024-01-15T10:00:00Z",
                "updatedAt": "2024-01-15T10:00:00Z"
            },
            {
                "id": 2,
                "title": "Como usar o Painel Administrativo",
                "excerpt": "Aprenda a usar todas as funcionalidades do painel administrativo do blog.",
                "content": "<p>Este é um guia rápido sobre como usar o <strong>painel administrativo</strong> do VibeWill Blog.</p><h2>🔐 Login</h2><p>Para acessar o painel, use as credenciais:</p><ul><li><strong>Usuário:</strong> vibewill</li><li><strong>Senha:</strong> 00220783</li></ul><h2>📝 Criando Posts</h2><p>No painel, você pode:</p><ul><li>Criar novos posts</li><li>Editar posts existentes</li><li>Gerenciar categorias e tags</li><li>Definir posts em destaque</li></ul><p>Use o editor com toolbar para formatar seu conteúdo com HTML!</p>",
                "category": "tecnologia",
                "date": "2024-01-14",
                "author": "VibeWill",
                "image": "fas fa-cog",
                "status": "published",
                "featured": False,
                "tags": ["tutorial", "admin", "guia"],
                "createdAt": "2024-01-14T15:00:00Z",
                "updatedAt": "2024-01-14T15:00:00Z"
            }
        ]
    
    def save_posts(self, posts):
        """Save posts to JSON file"""
        posts_file = 'data/posts.json'
        os.makedirs('data', exist_ok=True)
        
        # Backup existing file
        if os.path.exists(posts_file):
            backup_file = f"{posts_file}.backup"
            try:
                with open(posts_file, 'r', encoding='utf-8') as src:
                    with open(backup_file, 'w', encoding='utf-8') as dst:
                        dst.write(src.read())
            except:
                pass
        
        # Save new data
        with open(posts_file, 'w', encoding='utf-8') as f:
            json.dump(posts, f, ensure_ascii=False, indent=2)
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        response = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response)))
        self.end_headers()
        self.wfile.write(response)
    
    def send_error_response(self, status_code, message):
        """Send error response"""
        self.send_json_response({'error': message}, status_code)
    
    def log_message(self, format, *args):
        """Log customizado com cores"""
        timestamp = time.strftime('%H:%M:%S')
        message = format % args
        
        # Não mostrar logs de arquivos estáticos comuns
        if any(ext in message for ext in ['.css', '.js', '.ico', '.png', '.jpg', '.woff', '.ttf']):
            return
        
        # Colorir logs baseado no status
        if '200' in message:
            color = '\033[92m'  # Verde
        elif '404' in message:
            color = '\033[93m'  # Amarelo
        elif any(code in message for code in ['400', '403', '405', '500']):
            color = '\033[91m'  # Vermelho
        else:
            color = '\033[96m'  # Ciano
            
        reset_color = '\033[0m'
        print(f"{color}[{timestamp}] {message}{reset_color}")

def print_banner():
    """Exibe banner do blog"""
    banner = """
╔══════════════════════════════════════╗
║            VibeWill Blog             ║
║      Servidor Local com API          ║
╚══════════════════════════════════════╝
"""
    print(f"\033[95m{banner}\033[0m")

def check_files():
    """Verifica se os arquivos necessários existem"""
    required_files = [
        'index.html',
        'assets/css/style.css',
        'assets/js/main.js',
        'admin/login.html',
        'admin/panel.html',
        'admin/admin-panel.js'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    # Check data directory
    if not os.path.exists('data'):
        os.makedirs('data')
        print("📁 Pasta 'data' criada")
    
    # Check posts.json
    if not os.path.exists('data/posts.json'):
        print("📄 Arquivo posts.json será criado automaticamente")
    
    if missing_files:
        print(f"\033[91m❌ Arquivos não encontrados:\033[0m")
        for file in missing_files:
            print(f"   • {file}")
        print(f"\033[93m⚠️  O blog pode não funcionar corretamente.\033[0m")
        return False
    else:
        print(f"\033[92m✅ Todos os arquivos necessários encontrados!\033[0m")
        return True

def open_browser(url, delay=2):
    """Abre o navegador após um delay"""
    time.sleep(delay)
    try:
        webbrowser.open(url)
        print(f"\033[92m🌐 Navegador aberto automaticamente!\033[0m")
    except Exception as e:
        print(f"\033[93m⚠️  Não foi possível abrir o navegador: {e}\033[0m")
        print(f"   Abra manualmente: {url}")

def start_server(port=8000, host='localhost', open_browser_auto=True):
    """Inicia o servidor HTTP"""
    
    # Verificar arquivos
    print("🔍 Verificando arquivos do blog...")
    check_files()
    print()
    
    # Tentar encontrar uma porta disponível
    max_attempts = 10
    
    for attempt in range(max_attempts):
        try:
            with socketserver.TCPServer((host, port), BlogHTTPRequestHandler) as httpd:
                print_banner()
                
                # URLs importantes
                base_url = f"http://{host}:{port}"
                admin_url = f"{base_url}/admin/login.html"
                
                print(f"🚀 Servidor iniciado com sucesso!")
                print(f"📍 Blog: \033[96m{base_url}\033[0m")
                print(f"🔐 Admin: \033[96m{admin_url}\033[0m")
                print(f"👤 Login: \033[93mvibewill\033[0m / \033[93m00220783\033[0m")
                print()
                print("🎯 Funcionalidades disponíveis:")
                print("   • Blog principal com posts dinâmicos")
                print("   • Sistema de filtros por categoria")
                print("   • Tema escuro/claro")
                print("   • Painel administrativo completo")
                print("   • Editor de posts com toolbar")
                print("   • API REST para gerenciar posts")
                print("   • Persistência automática em JSON")
                print()
                print("📡 API Endpoints:")
                print(f"   • GET    {base_url}/api/posts       - Listar posts")
                print(f"   • POST   {base_url}/api/posts       - Criar post")
                print(f"   • PUT    {base_url}/api/posts/{{id}} - Atualizar post")
                print(f"   • DELETE {base_url}/api/posts/{{id}} - Deletar post")
                print()
                print("🛑 Para parar o servidor: Ctrl+C")
                print("=" * 60)
                
                # Abrir navegador automaticamente
                if open_browser_auto:
                    browser_thread = threading.Thread(target=open_browser, args=(base_url,))
                    browser_thread.daemon = True
                    browser_thread.start()
                
                # Iniciar servidor
                httpd.serve_forever()
                
        except OSError as e:
            if e.errno == 98 or "Address already in use" in str(e):  # Porta em uso
                port += 1
                if attempt < max_attempts - 1:
                    print(f"⚠️  Porta {port-1} está em uso, tentando porta {port}...")
                    continue
                else:
                    print(f"\033[91m❌ Não foi possível encontrar uma porta disponível após {max_attempts} tentativas.\033[0m")
                    print(f"   Tente especificar uma porta diferente ou feche outros servidores.")
                    sys.exit(1)
            else:
                print(f"\033[91m❌ Erro ao iniciar servidor: {e}\033[0m")
                sys.exit(1)
        except KeyboardInterrupt:
            print(f"\n\033[93m👋 Servidor parado pelo usuário.\033[0m")
            print("Obrigado por usar o VibeWill Blog!")
            sys.exit(0)
        except Exception as e:
            print(f"\033[91m❌ Erro inesperado: {e}\033[0m")
            sys.exit(1)

def show_help():
    """Mostra ajuda de uso"""
    help_text = """
VibeWill Blog - Servidor Local com API REST

Uso: python server.py [opções]

Opções:
  --port PORT     Porta do servidor (padrão: 8000)
  --host HOST     Host do servidor (padrão: localhost)
  --no-browser    Não abrir navegador automaticamente
  --help, -h      Mostrar esta ajuda

Exemplos:
  python server.py                    # Iniciar na porta 8000
  python server.py --port 3000       # Iniciar na porta 3000  
  python server.py --host 0.0.0.0    # Permitir acesso externo
  python server.py --no-browser      # Não abrir navegador

URLs importantes:
  • Blog: http://localhost:8000
  • Admin: http://localhost:8000/admin/login.html
  • API: http://localhost:8000/api/posts
  • Login: vibewill / 00220783

API Endpoints:
  • GET /api/posts          - Listar todos os posts
  • POST /api/posts         - Criar novo post
  • PUT /api/posts/{id}     - Atualizar post existente
  • DELETE /api/posts/{id}  - Deletar post

Dados são salvos automaticamente em data/posts.json
"""
    print(help_text)

def main():
    """Função principal"""
    # Argumentos da linha de comando
    args = sys.argv[1:]
    
    # Configurações padrão
    port = 8000
    host = 'localhost'
    open_browser_auto = True
    
    # Processar argumentos
    i = 0
    while i < len(args):
        arg = args[i]
        
        if arg in ['--help', '-h']:
            show_help()
            sys.exit(0)
        elif arg == '--port':
            if i + 1 < len(args):
                try:
                    port = int(args[i + 1])
                    i += 1
                except ValueError:
                    print(f"\033[91m❌ Porta inválida: {args[i + 1]}\033[0m")
                    sys.exit(1)
            else:
                print(f"\033[91m❌ --port requer um valor\033[0m")
                sys.exit(1)
        elif arg == '--host':
            if i + 1 < len(args):
                host = args[i + 1]
                i += 1
            else:
                print(f"\033[91m❌ --host requer um valor\033[0m")
                sys.exit(1)
        elif arg == '--no-browser':
            open_browser_auto = False
        else:
            print(f"\033[91m❌ Argumento desconhecido: {arg}\033[0m")
            print("Use --help para ver as opções disponíveis.")
            sys.exit(1)
        
        i += 1
    
    # Verificar se estamos no diretório correto
    if not os.path.exists('index.html'):
        print(f"\033[91m❌ Arquivo index.html não encontrado!\033[0m")
        print("Execute este script a partir da pasta do blog.")
        sys.exit(1)
    
    # Iniciar servidor
    start_server(port, host, open_browser_auto)

if __name__ == '__main__':
    main()
