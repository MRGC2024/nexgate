# Corrigir "Docker Desktop is unable to start" (Windows)

Quando aparece **"Docker Desktop is unable to start"** ou **"unable to get image"** porque o Docker Desktop não consegue iniciar, siga estes passos **na ordem**. Não pule.

---

## 1. Conferir requisitos do Windows

O Docker Desktop no Windows precisa de **uma** destas opções:

- **WSL 2** (recomendado no Windows 10/11), **ou**
- **Hyper-V** (algumas edições do Windows 10/11).

### 1.1 Versão do Windows

1. Aperte **Windows + R**, digite `winver` e dê Enter.
2. Veja a versão (ex.: Windows 10 22H2 ou Windows 11).
3. **Windows 10:** precisa ser **versão 2004 ou superior** (Build 19041 ou maior).
4. **Windows 11:** qualquer versão recente serve.

Se a versão for antiga, atualize o Windows (Configurações → Atualização e segurança → Verificar atualizações).

---

## 2. Habilitar WSL 2 (recomendado)

O Docker Desktop usa WSL 2 por padrão. Se o WSL não estiver instalado ou ativado, o Docker não sobe.

### 2.1 Abrir PowerShell como Administrador

1. Clique no **Menu Iniciar**.
2. Digite **PowerShell**.
3. Clique com o botão direito em **Windows PowerShell**.
4. Escolha **Executar como administrador**.
5. Se aparecer pergunta de permissão, clique em **Sim**.

### 2.2 Instalar e habilitar WSL

No PowerShell **como administrador**, rode **um comando por vez** (copie, cole, Enter):

```powershell
wsl --install
```

Espere terminar. Pode pedir para **reiniciar o PC**. Se pedir, reinicie e depois volte aqui.

Depois do reinício (se tiver reiniciado), abra o PowerShell de novo **como administrador** e rode:

```powershell
wsl --set-default-version 2
```

Se aparecer que o WSL 2 não está instalado, rode de novo:

```powershell
wsl --install -d Ubuntu
```

(Isso instala uma distribuição Linux leve usada pelo WSL 2.)

### 2.3 Conferir se o WSL 2 está ativo

No PowerShell (pode ser normal, não precisa ser admin):

```powershell
wsl --list --verbose
```

Na coluna **VERSION**, deve aparecer **2** para a distribuição (ex.: Ubuntu). Se aparecer 1, rode (como admin):

```powershell
wsl --set-version Ubuntu 2
```

(troque `Ubuntu` pelo nome que aparecer na lista.)

---

## 3. Virtualização habilitada na BIOS

O WSL 2 e o Hyper-V usam virtualização. Ela precisa estar **ativada** na BIOS/UEFI.

1. Reinicie o PC.
2. Na inicialização, entre na BIOS/UEFI (geralmente **F2**, **F10**, **Del** ou **Esc** – a tela de boot costuma mostrar a tecla).
3. Procure opções com nomes como:
   - **Virtualization Technology**
   - **VT-x** (Intel)
   - **AMD-V** (AMD)
   - **SVM Mode**
4. Coloque em **Enabled** / **Ativado**.
5. Salve e saia (geralmente **F10** para Save & Exit).

Se não achar a opção, procure no manual da placa-mãe ou do notebook pelo termo “virtualization” ou “virtualização”.

---

## 4. Reiniciar o Docker Desktop

1. Feche o Docker Desktop completamente (botão direito no ícone na bandeja → **Quit Docker Desktop**).
2. Abra o **Gerenciador de Tarefas** (Ctrl+Shift+Esc).
3. Aba **Processos**: procure **Docker** ou **com.docker.** e finalize todos.
4. Abra o Docker Desktop de novo pelo Menu Iniciar.
5. Espere até o ícone na bandeja indicar que está “running” (sem animação de “iniciando”).

Se ainda aparecer “Docker Desktop is unable to start”, vá para o passo 5.

---

## 5. Reparar/reinstalar o Docker Desktop

### 5.1 Reparar

1. **Configurações do Windows** → **Aplicativos** → **Aplicativos instalados**.
2. Procure **Docker Desktop**.
3. Clique nos três pontinhos → **Modificar** ou **Reparar**.
4. Siga o assistente e reinicie o PC se pedir.

### 5.2 Se não resolver: desinstalar e instalar de novo

1. **Desinstalar** o Docker Desktop (Aplicativos → Docker Desktop → Desinstalar).
2. Reinicie o PC.
3. Baixe a versão mais recente: **https://www.docker.com/products/docker-desktop/**
4. Instale e, quando perguntar, marque **Use WSL 2**.
5. Reinicie o PC se o instalador pedir.
6. Abra o Docker Desktop e espere iniciar por completo.

---

## 6. Testar se o Docker está funcionando

Abra o **PowerShell** ou o **Terminal do Cursor** e rode:

```powershell
docker --version
```

Deve aparecer algo como `Docker version 24.x.x`.

Depois:

```powershell
docker run hello-world
```

Deve baixar uma imagem pequena e mostrar uma mensagem de “Hello from Docker!”.  
Se isso funcionar, o Docker está ok.

---

## 7. Subir o NEXGATE com Docker

Na pasta do projeto:

```powershell
cd "c:\Users\drrod\Downloads\PROJETO GATEWAY"
docker compose up -d
```

(Se o seu instalador usar o comando antigo: `docker-compose up -d`.)

- O aviso sobre `version` no `docker-compose.yml` pode aparecer; não impede de rodar.
- Se aparecer de novo **“Docker Desktop is unable to start”**, o problema ainda é o Docker não estar iniciando: volte ao **passo 4** e, se preciso, **passo 5** e confira **WSL 2** e **virtualização na BIOS**.

---

## Resumo rápido

| Problema | O que fazer |
|----------|-------------|
| Docker não inicia | Habilitar WSL 2 (`wsl --install`, reiniciar, `wsl --set-default-version 2`). |
| WSL em versão 1 | `wsl --set-version Ubuntu 2` (como admin). |
| Virtualização | Ativar na BIOS (VT-x / AMD-V / SVM). |
| Ainda não inicia | Reparar ou desinstalar e reinstalar o Docker Desktop; reiniciar o PC. |
| “unable to get image” por Docker parado | Resolver o início do Docker (passos acima); depois rodar `docker compose up -d`. |

Quando o Docker Desktop estiver iniciando sem erro e `docker run hello-world` funcionar, o gateway sobe com `docker compose up -d` e você segue o restante do **GUIA-INICIANTE** a partir do **Passo 2.2**.
