/**
 * Servicio para gestionar la comunicación con la API de mensajes
 */
import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class MessageService {
  /**
   * Obtiene todos los mensajes del usuario actual
   * @returns {Promise} Promesa con los mensajes
   */
  async getMyMessages() {
    const response = await axios.get(`${API_URL}/messages`, { headers: authHeader() });
    return response.data;
  }

  /**
   * Obtiene los mensajes no leídos del usuario actual
   * @returns {Promise} Promesa con los mensajes no leídos
   */
  async getUnreadMessages() {
    const response = await axios.get(`${API_URL}/messages/unread`, { headers: authHeader() });
    return response.data;
  }

  /**
   * Obtiene la conversación con un usuario específico
   * @param {string} userId - ID del usuario con quien se tiene la conversación
   * @returns {Promise} Promesa con los mensajes de la conversación
   */
  async getConversation(userId) {
    const response = await axios.get(`${API_URL}/messages/conversation/${userId}`, { headers: authHeader() });
    return response.data;
  }

  /**
   * Envía un mensaje a otro usuario
   * @param {Object} messageData - Datos del mensaje a enviar
   * @param {string} messageData.recipient - ID del destinatario
   * @param {string} messageData.content - Contenido del mensaje
   * @returns {Promise} Promesa con el mensaje enviado
   */
  async sendMessage(messageData) {
    const response = await axios.post(`${API_URL}/messages`, messageData, { headers: authHeader() });
    return response.data;
  }

  /**
   * Marca un mensaje como leído
   * @param {string} messageId - ID del mensaje a marcar como leído
   * @returns {Promise} Promesa con el mensaje actualizado
   */
  async markAsRead(messageId) {
    const response = await axios.put(`${API_URL}/messages/${messageId}/read`, {}, { headers: authHeader() });
    return response.data;
  }

  /**
   * Elimina un mensaje
   * @param {string} messageId - ID del mensaje a eliminar
   * @returns {Promise} Promesa con el resultado de la operación
   */
  async deleteMessage(messageId) {
    const response = await axios.delete(`${API_URL}/messages/${messageId}`, { headers: authHeader() });
    return response.data;
  }
}

export default new MessageService();