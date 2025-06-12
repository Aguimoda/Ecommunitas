# Tests de Ecommunitas Frontend

**Documentación completa del sistema de testing para la aplicación Ecommunitas**

Esta carpeta contiene todos los tests unitarios, de integración y end-to-end para la aplicación Ecommunitas. El sistema de testing está diseñado para garantizar la calidad, estabilidad y mantenibilidad del código frontend.

## 🎯 Objetivos del Testing

- **Calidad del Código**: Garantizar que todas las funcionalidades trabajen correctamente
- **Prevención de Regresiones**: Detectar errores antes de que lleguen a producción
- **Documentación Viva**: Los tests sirven como documentación del comportamiento esperado
- **Refactoring Seguro**: Permitir cambios en el código con confianza
- **Desarrollo Ágil**: Facilitar el desarrollo iterativo y la integración continua

## Estructura

```
src/tests/
├── composables/          # Tests para composables de Vue
│   ├── useAuth.test.ts
│   ├── useLocalStorage.test.ts
│   └── usePagination.test.ts
├── services/             # Tests para servicios de API
│   ├── authService.test.ts
│   └── itemService.test.ts
├── components/           # Tests para componentes Vue (TODO)
├── stores/              # Tests para stores de Pinia (TODO)
├── utils/               # Tests para utilidades (TODO)
└── README.md            # Este archivo
```

## Tecnologías Utilizadas

- **Vitest**: Framework de testing rápido y moderno
- **Vue Test Utils**: Utilidades oficiales para testing de componentes Vue
- **@testing-library/vue**: Biblioteca alternativa para testing centrado en el usuario
- **MSW (Mock Service Worker)**: Para mockear APIs en tests de integración

## Convenciones de Naming

- Los archivos de test deben terminar en `.test.ts` o `.spec.ts`
- Los nombres de archivos deben coincidir con el archivo que están probando
- Ejemplo: `useAuth.ts` → `useAuth.test.ts`

## Estructura de Tests

Cada archivo de test debe seguir esta estructura:

```typescript
/**
 * @file nombreArchivo.test.ts
 * @description Test suite for nombreArchivo
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
// Otros imports...

// Mocks globales
vi.mock('dependencia', () => ({...}))

describe('NombreDelModulo', () => {
  beforeEach(() => {
    // Setup antes de cada test
  })

  afterEach(() => {
    // Cleanup después de cada test
  })

  describe('Funcionalidad específica', () => {
    it('should do something specific', () => {
      // Test implementation
    })
  })
})
```

## Tipos de Tests

### 1. Tests de Composables

Los composables deben probarse de forma aislada, mockeando sus dependencias:

```typescript
// Ejemplo para useAuth
it('should login successfully', async () => {
  const { login, user, isAuthenticated } = useAuth()
  
  const result = await login(mockCredentials)
  
  expect(result.success).toBe(true)
  expect(user.value).toEqual(mockUser)
  expect(isAuthenticated.value).toBe(true)
})
```

### 2. Tests de Servicios

Los servicios deben probarse mockeando las llamadas HTTP:

```typescript
// Ejemplo para authService
it('should fetch user data', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockUser
  })
  
  const result = await authService.getCurrentUser()
  
  expect(result).toEqual(mockUser)
  expect(mockFetch).toHaveBeenCalledWith('/api/auth/me')
})
```

### 3. Tests de Componentes (TODO)

Los componentes deben probarse desde la perspectiva del usuario:

```typescript
// Ejemplo para LoginForm
it('should submit login form', async () => {
  const { getByLabelText, getByRole } = render(LoginForm)
  
  await userEvent.type(getByLabelText('Email'), 'test@example.com')
  await userEvent.type(getByLabelText('Password'), 'password')
  await userEvent.click(getByRole('button', { name: 'Login' }))
  
  expect(mockLogin).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password'
  })
})
```

## Mocking Guidelines

### 1. Mocking de Módulos

```typescript
// Mock completo de un módulo
vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

// Mock parcial de un módulo
vi.mock('@/utils/helpers', async () => {
  const actual = await vi.importActual('@/utils/helpers')
  return {
    ...actual,
    formatDate: vi.fn(() => '2024-01-01')
  }
})
```

### 2. Mocking de APIs

```typescript
// Mock de fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

### 3. Mocking de Vue Router

```typescript
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  }),
  useRoute: () => ({
    params: { id: '1' },
    query: {}
  })
}))
```

## Datos de Prueba

Crear objetos mock reutilizables:

```typescript
// Mock data
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockItem: Item = {
  id: '1',
  title: 'Test Item',
  description: 'Test description',
  // ... otros campos
}
```

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests específicos
npm run test -- useAuth

# Ejecutar tests en modo UI
npm run test:ui
```

## Coverage Goals

- **Composables**: 90%+ coverage
- **Servicios**: 85%+ coverage
- **Componentes**: 80%+ coverage
- **Stores**: 85%+ coverage
- **Utilidades**: 90%+ coverage

## Best Practices

1. **Arrange, Act, Assert**: Estructura clara en cada test
2. **Un concepto por test**: Cada test debe probar una sola cosa
3. **Nombres descriptivos**: Los nombres deben explicar qué se está probando
4. **Cleanup**: Siempre limpiar mocks y estado entre tests
5. **Isolation**: Los tests no deben depender unos de otros
6. **Fast**: Los tests deben ejecutarse rápidamente
7. **Deterministic**: Los tests deben dar el mismo resultado siempre

## Debugging Tests

```typescript
// Para debugging, usar console.log o debugger
it('should debug test', () => {
  console.log('Debug info:', someValue)
  debugger // Pausa en DevTools
  expect(someValue).toBe(expectedValue)
})

// Usar it.only para ejecutar solo un test
it.only('should run only this test', () => {
  // Test implementation
})

// Usar it.skip para saltar un test
it.skip('should skip this test', () => {
  // Test implementation
})
```

## TODO

- [ ] Agregar tests para componentes Vue
- [ ] Agregar tests para stores de Pinia
- [ ] Agregar tests para utilidades
- [ ] Configurar tests de integración con MSW
- [ ] Agregar tests E2E con Playwright
- [ ] Configurar CI/CD para ejecutar tests automáticamente
- [ ] Agregar tests de accesibilidad
- [ ] Configurar visual regression testing

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library Vue](https://testing-library.com/docs/vue-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Vue Testing Handbook](https://lmiller1990.github.io/vue-testing-handbook/)