<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
      <p v-if="errors.title" class="mt-2 text-sm text-red-600">{{ errors.title }}</p>
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="3"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      ></textarea>
      <p v-if="errors.description" class="mt-2 text-sm text-red-600">{{ errors.description }}</p>
    </div>

    <div>
      <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
      <select
        id="category"
        v-model="formData.category"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="books">Books</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="furniture">Furniture</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div>
      <label for="condition" class="block text-sm font-medium text-gray-700">Condition</label>
      <select
        id="condition"
        v-model="formData.condition"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="new">New</option>
        <option value="like_new">Like New</option>
        <option value="good">Good</option>
        <option value="fair">Fair</option>
        <option value="poor">Poor</option>
      </select>
    </div>

    <div>
      <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
      <input
        id="location"
        v-model="formData.location"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Image</label>
      <ImageUploader @file-selected="handleImageUpload" />
      <p v-if="errors.imageUrl" class="mt-2 text-sm text-red-600">{{ errors.imageUrl }}</p>
    </div>

    <div>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {{ isSubmitting ? 'Processing...' : 'Submit' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import ImageUploader from './ImageUploader.vue';
import { createItem, updateItem } from '@/services/itemService';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      description: '',
      category: '',
      condition: '',
      location: '',
      imageUrl: ''
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['success']);

const formData = ref({ ...props.initialData });
const errors = ref({});
const isSubmitting = ref(false);

const handleImageUpload = async (file) => {
  try {
    // Upload logic here
    formData.value.imageUrl = 'https://example.com/image.jpg';
  } catch (error) {
    errors.value.imageUrl = 'Failed to upload image';
  }
};

const validateForm = () => {
  const newErrors = {};
  if (!formData.value.title) newErrors.title = 'Title is required';
  if (!formData.value.description) newErrors.description = 'Description is required';
  if (!formData.value.imageUrl) newErrors.imageUrl = 'Image is required';
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  try {
    if (props.isEditing) {
      await updateItem(formData.value._id, formData.value);
    } else {
      await createItem(formData.value);
    }
    emit('success');
  } catch (error) {
    errors.value.submit = error.message;
  } finally {
    isSubmitting.value = false;
  }
};
</script>