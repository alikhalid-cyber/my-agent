"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Port {
  id: string;
  name: string;
  portNumber: number;
  protocol: string;
  host: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PortsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state for new port
  const [newPort, setNewPort] = useState({
    name: '',
    portNumber: 8080,
    protocol: 'http',
    host: 'localhost',
    description: ''
  });

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch ports
  const fetchPorts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ports');
      
      if (!response.ok) {
        throw new Error('Failed to fetch ports');
      }
      
      const data = await response.json();
      setPorts(data.ports || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load ports on component mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPorts();
    }
  }, [status]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPort(prev => ({
      ...prev,
      [name]: name === 'portNumber' ? parseInt(value) || 0 : value
    }));
  };

  // Create new port
  const handleCreatePort = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/ports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPort)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create port');
      }
      
      // Reset form and close modal
      setNewPort({
        name: '',
        portNumber: 8080,
        protocol: 'http',
        host: 'localhost',
        description: ''
      });
      setShowAddModal(false);
      
      // Refresh ports list
      fetchPorts();
    } catch (err: any) {
      setError(err.message || 'Failed to create port');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete port
  const handleDeletePort = async (id: string) => {
    if (!confirm('Are you sure you want to delete this port?')) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/ports/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete port');
      }
      
      // Refresh ports list
      fetchPorts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete port');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // If loading or not authenticated yet
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Page navigation */}
      <div className="flex justify-center mb-4 space-x-4">
        <Link href="/chain" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Chain
        </Link>
        <Link href="/ports" className="px-4 py-2 bg-indigo-700 text-white rounded-md">
          Ports
        </Link>
        <Link href="/api-settings" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          API Settings
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Ports Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add New Port
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {loading && !showAddModal ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {ports.length === 0 ? (
            <div className="p-6 text-center text-black">
              <p>No ports found. Add your first port to get started.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Port</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Protocol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Host</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ports.map(port => (
                  <tr key={port.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-black">{port.name}</div>
                      {port.description && (
                        <div className="text-sm text-black">{port.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {port.portNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {port.protocol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {port.host}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        port.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {port.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/ports/${port.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePort(port.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Add Port Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Port</h2>
            
            <form onSubmit={handleCreatePort}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={newPort.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Service name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="portNumber" className="block text-sm font-medium text-black mb-1">
                  Port Number *
                </label>
                <input
                  id="portNumber"
                  name="portNumber"
                  type="number"
                  min="1"
                  max="65535"
                  value={newPort.portNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="protocol" className="block text-sm font-medium text-black mb-1">
                    Protocol
                  </label>
                  <select
                    id="protocol"
                    name="protocol"
                    value={newPort.protocol}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="host" className="block text-sm font-medium text-black mb-1">
                    Host
                  </label>
                  <input
                    id="host"
                    name="host"
                    type="text"
                    value={newPort.host}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="localhost"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newPort.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Port'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 