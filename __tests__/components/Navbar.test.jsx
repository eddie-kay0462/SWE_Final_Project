import { render, screen, fireEvent } from '@testing-library/react'
import { useTheme } from '@/contexts/theme-context'
import Navbar from '@/components/navbar'

// Mock the theme context
jest.mock('@/contexts/theme-context', () => ({
  useTheme: jest.fn(),
}))

describe('Navbar', () => {
  const mockToggleTheme = jest.fn()

  beforeEach(() => {
    // Setup default theme context mock
    useTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the navbar with logo and brand name', () => {
    render(<Navbar />)
    expect(screen.getByText('CSOFT')).toBeInTheDocument()
  })

  it('renders navigation links in desktop view', () => {
    render(<Navbar />)
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })

  it('toggles theme when theme button is clicked', () => {
    render(<Navbar />)
    const themeButton = screen.getByLabelText('Switch to dark mode')
    fireEvent.click(themeButton)
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('shows mobile menu when hamburger button is clicked', () => {
    render(<Navbar />)
    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)
    
    // Check if mobile menu items are visible
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('displays correct theme icon based on current theme', () => {
    // Test light theme
    useTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })
    render(<Navbar />)
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument()

    // Test dark theme
    useTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    })
    render(<Navbar />)
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
  })

  it('renders user menu with correct items', () => {
    render(<Navbar />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
}) 