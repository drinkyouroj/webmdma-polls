import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';

// Mock the child components
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar Component</div>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer Component</div>,
}));

// Mock the Outlet component from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

describe('Layout', () => {
  it('renders the layout with navbar, content area, and footer', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );
    
    // Check for main structure elements
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    // Check that the main content area exists with correct classes
    const mainElement = screen.getByTestId('outlet').parentElement;
    expect(mainElement).toHaveClass('flex-grow');
    expect(mainElement).toHaveClass('container');
  });
});