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
        <option value="" disabled>Select a category</option>
        <option value="books">Books</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="furniture">Furniture</option>
        <option value="other">Other</option>
      </select>
      <p v-if="errors.category" class="mt-2 text-sm text-red-600">{{ errors.category }}</p>
    </div>

    <div>
      <label for="condition" class="block text-sm font-medium text-gray-700">Condition</label>
      <select
        id="condition"
        v-model="formData.condition"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="" disabled>Select condition</option>
        <option value="new">New</option>
        <option value="like_new">Like New</option>
        <option value="good">Good</option>
        <option value="fair">Fair</option>
        <option value="poor">Poor</option>
      </select>
      <p v-if="errors.condition" class="mt-2 text-sm text-red-600">{{ errors.condition }}</p>
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
      <p v-if="errors.location" class="mt-2 text-sm text-red-600">{{ errors.location }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Image (Required)</label>
      <ImageUploader @file-selected="handleImageUpload" />
      <p v-if="errors.image" class="mt-2 text-sm text-red-600">{{ errors.image }}</p>
    </div>

    <div>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Processing...' : (isEditing ? 'Update Item' : 'Submit Item') }}
      </button>
    </div>
    <p v-if="errors.submit" class="mt-2 text-sm text-red-600">{{ errors.submit }}</p>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import ImageUploader from './ImageUploader.vue';
import { createItem, updateItem } from '@/services/itemService';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      _id: null,
      title: '',
      description: '',
      category: '',
      condition: '',
      location: '',
      imageUrls: []
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['success']);

const formData = ref({ ...props.initialData });
const imageFile = ref(null);
const errors = ref({});
const isSubmitting = ref(false);

// Watch for changes in initialData to update the form when editing
watch(() => props.initialData, (newData) => {
  formData.value = { ...newData };
  imageFile.value = null;
}, { deep: true });

const handleImageUpload = (file) => {
  // Store the selected file object
  imageFile.value = file;
  if (!file) {
    errors.value.image = 'Image is required';
  } else {
    delete errors.value.image;
  }
};

const validateForm = () => {
  const newErrors = {};
  if (!formData.value.title) newErrors.title = 'Title is required';
  if (!formData.value.description) newErrors.description = 'Description is required';
  if (!formData.value.category) newErrors.category = 'Category is required';
  if (!formData.value.condition) newErrors.condition = 'Condition is required';
  if (!formData.value.location) newErrors.location = 'Location is required';
  // Validate image for new items or when editing without existing images
  if (!props.isEditing && !imageFile.value) {
    newErrors.image = 'Image is required';
  }
  // For editing, require image only if no existing images and no new file selected
  if (props.isEditing && !imageFile.value && (!formData.value.imageUrls || formData.value.imageUrls.length === 0)) {
    newErrors.image = 'Image is required when editing if no image exists';
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Please fix the errors in the form.');
    return;
  }

  isSubmitting.value = true;
  errors.value = {};

  // Create FormData to handle file upload
  const data = new FormData();
  data.append('title', formData.value.title);
  data.append('description', formData.value.description);
  data.append('category', formData.value.category);
  data.append('condition', formData.value.condition);
  data.append('location', formData.value.location);

  // Log FormData entries for debugging
  console.log('Frontend: FormData before sending:');
  for (let pair of data.entries()) {
    console.log(pair[0]+ ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
  }

  // Append the image file if it exists (for create or update)
  if (imageFile.value) {
    data.append('images', imageFile.value);
  }

  try {
    if (props.isEditing) {
      await updateItem(formData.value._id, data);
      toast.success('Artículo actualizado correctamente');
    } else {
      await createItem(data);
      toast.success('Artículo registrado correctamente');
    }
    emit('success');
  } catch (error) {
    console.error('Error submitting item:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Error al procesar el artículo';
    toast.error(errorMessage);
    errors.value.submit = errorMessage;
  } finally {
    isSubmitting.value = false;
  }
};
</script>