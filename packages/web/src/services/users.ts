import {apiClient} from './api'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'customer' | 'vendor' | 'admin' | 'super_admin'
  createdAt: string
  updatedAt: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

export interface DeletionRequest {
  id: string
  userId: string
  requestedBy: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface DeletionRequestInput {
  userId: string
  reason?: string
}

export interface ApproveDeletionInput {
  requestId: string
  approved: boolean
}

export const userService = {
  // ============================================
  // UTILISATEURS - Opérations de base
  // ============================================

  // GET - Récupérer tous les utilisateurs (Admin/Super Admin)
  getAll: () =>
    apiClient.get('/users'),

  // GET - Récupérer un utilisateur par ID
  getById: (id: string) =>
    apiClient.get(`/users/${id}`),

  // PUT - Modifier un utilisateur (Super Admin seulement)
  update: (id: string, data: UpdateUserInput) =>
    apiClient.put(`/users/${id}`, data),

  // DELETE - Supprimer un utilisateur directement (Super Admin seulement)
  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),

  // GET - Récupérer le profil de l'utilisateur actuel
  getProfile: () =>
    apiClient.get('/users/profile/me'),

  // PUT - Mettre à jour le profil de l'utilisateur actuel
  updateProfile: (data: UpdateUserInput) =>
    apiClient.put('/users/profile/me', data),

  // POST - Changer le mot de passe
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post('/users/change-password', { oldPassword, newPassword }),

  // GET - Récupérer les utilisateurs avec un rôle spécifique
  getByRole: (role: 'customer' | 'vendor' | 'admin' | 'super_admin') =>
    apiClient.get(`/users/role/${role}`),

  // ============================================
  // DEMANDES DE SUPPRESSION (Deletion Requests)
  // ============================================

  // POST - Demander la suppression d'un utilisateur (Admin)
  requestDeletion: (data: DeletionRequestInput) =>
    apiClient.post('/users/deletion-requests', data),

  // GET - Récupérer toutes les demandes de suppression (Super Admin)
  getDeletionRequests: (status?: 'pending' | 'approved' | 'rejected') =>
    apiClient.get('/users/deletion-requests', {
      params: status ? { status } : undefined,
    }),

  // GET - Récupérer une demande de suppression par ID
  getDeletionRequest: (requestId: string) =>
    apiClient.get(`/users/deletion-requests/${requestId}`),

  // PUT - Approuver ou rejeter une demande de suppression (Super Admin seulement)
  approveDeletionRequest: (requestId: string, approved: boolean, reason?: string) =>
    apiClient.put(`/users/deletion-requests/${requestId}`, { approved, reason }),

  // GET - Récupérer les demandes de suppression en attente (Super Admin)
  getPendingDeletionRequests: () =>
    apiClient.get('/users/deletion-requests?status=pending'),

  // GET - Récupérer l'historique des demandes de suppression d'un utilisateur
  getUserDeletionHistory: (userId: string) =>
    apiClient.get(`/users/${userId}/deletion-history`),

  // ============================================
  // GESTION DES RÔLES
  // ============================================

  // PUT - Changer le rôle d'un utilisateur (Super Admin seulement)
  changeRole: (userId: string, newRole: 'customer' | 'vendor' | 'admin' | 'super_admin') =>
    apiClient.put(`/users/${userId}/role`, { role: newRole }),

  // GET - Récupérer les Admins
  getAdmins: () =>
    apiClient.get('/users/role/admin'),

  // GET - Récupérer les Super Admins
  getSuperAdmins: () =>
    apiClient.get('/users/role/super_admin'),

  // GET - Récupérer les Vendeurs
  getVendors: () =>
    apiClient.get('/users/role/vendor'),

  // GET - Récupérer les Clients
  getCustomers: () =>
    apiClient.get('/users/role/customer'),

  // ============================================
  // PERMISSIONS ET AUDIT
  // ============================================

  // GET - Récupérer les permissions de l'utilisateur actuel
  getMyPermissions: () =>
    apiClient.get('/users/permissions/me'),

  // GET - Vérifier si l'utilisateur a une permission spécifique
  hasPermission: (permission: string) =>
    apiClient.get(`/users/permissions/check/${permission}`),

  // GET - Récupérer l'historique des actions (Audit)
  getAuditLog: (filters?: { userId?: string; action?: string; startDate?: string; endDate?: string }) =>
    apiClient.get('/users/audit-log', { params: filters }),

  // ============================================
  // ACTIONS SUPER ADMIN
  // ============================================

  // POST - Créer un nouvel Admin (Super Admin seulement)
  createAdmin: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/users/create-admin', data),

  // PUT - Désactiver un compte utilisateur (Super Admin seulement)
  deactivateUser: (userId: string, reason?: string) =>
    apiClient.put(`/users/${userId}/deactivate`, { reason }),

  // PUT - Réactiver un compte utilisateur (Super Admin seulement)
  reactivateUser: (userId: string) =>
    apiClient.put(`/users/${userId}/reactivate`, {}),

  // POST - Envoyer une notification à un utilisateur (Super Admin/Admin)
  sendNotification: (userId: string, message: string) =>
    apiClient.post(`/users/${userId}/notify`, { message }),
}

export default userService