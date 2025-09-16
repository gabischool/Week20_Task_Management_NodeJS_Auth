import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpassword123'
};

const testTask = {
  title: 'Test Task',
  description: 'This is a test task',
  status: 'pending',
  priority: 'medium'
};

let authToken = '';
let createdTaskId = '';

// Helper function to make authenticated requests
const authenticatedRequest = async (url, options = {}) => {
  if (authToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${authToken}`
    };
  }
  return fetch(url, options);
};

// Test 1: User Registration
console.log('🧪 Testing User Registration...');
try {
  const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  
  const registerData = await registerResponse.json();
  
  if (registerResponse.ok) {
    console.log('✅ Registration successful:', registerData.message);
    authToken = registerData.data.token;
  } else {
    console.log('❌ Registration failed:', registerData.message);
  }
} catch (error) {
  console.log('❌ Registration error:', error.message);
}

// Test 2: User Login
console.log('\n🧪 Testing User Login...');
try {
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });
  
  const loginData = await loginResponse.json();
  
  if (loginResponse.ok) {
    console.log('✅ Login successful:', loginData.message);
    authToken = loginData.data.token;
  } else {
    console.log('❌ Login failed:', loginData.message);
  }
} catch (error) {
  console.log('❌ Login error:', error.message);
}

// Test 3: Get User Profile
console.log('\n🧪 Testing Get User Profile...');
try {
  const profileResponse = await authenticatedRequest(`${BASE_URL}/auth/me`);
  const profileData = await profileResponse.json();
  
  if (profileResponse.ok) {
    console.log('✅ Profile retrieved successfully');
    console.log('   User:', profileData.data.name);
  } else {
    console.log('❌ Profile retrieval failed:', profileData.message);
  }
} catch (error) {
  console.log('❌ Profile error:', error.message);
}

// Test 4: Create Task
console.log('\n🧪 Testing Task Creation...');
try {
  const createTaskResponse = await authenticatedRequest(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testTask)
  });
  
  const createTaskData = await createTaskResponse.json();
  
  if (createTaskResponse.ok) {
    console.log('✅ Task created successfully');
    createdTaskId = createTaskData.data.id;
    console.log('   Task ID:', createdTaskId);
  } else {
    console.log('❌ Task creation failed:', createTaskData.message);
  }
} catch (error) {
  console.log('❌ Task creation error:', error.message);
}

// Test 5: Get All Tasks
console.log('\n🧪 Testing Get All Tasks...');
try {
  const tasksResponse = await authenticatedRequest(`${BASE_URL}/tasks`);
  const tasksData = await tasksResponse.json();
  
  if (tasksResponse.ok) {
    console.log('✅ Tasks retrieved successfully');
    console.log('   Total tasks:', tasksData.count);
  } else {
    console.log('❌ Tasks retrieval failed:', tasksData.message);
  }
} catch (error) {
  console.log('❌ Tasks error:', error.message);
}

// Test 6: Get Task by ID
if (createdTaskId) {
  console.log('\n🧪 Testing Get Task by ID...');
  try {
    const taskResponse = await authenticatedRequest(`${BASE_URL}/tasks/${createdTaskId}`);
    const taskData = await taskResponse.json();
    
    if (taskResponse.ok) {
      console.log('✅ Task retrieved successfully');
      console.log('   Task title:', taskData.data.title);
    } else {
      console.log('❌ Task retrieval failed:', taskData.message);
    }
  } catch (error) {
    console.log('❌ Task retrieval error:', error.message);
  }
}

// Test 7: Update Task
if (createdTaskId) {
  console.log('\n🧪 Testing Task Update...');
  try {
    const updateTaskResponse = await authenticatedRequest(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' })
    });
    
    const updateTaskData = await updateTaskResponse.json();
    
    if (updateTaskResponse.ok) {
      console.log('✅ Task updated successfully');
      console.log('   New status:', updateTaskData.data.status);
    } else {
      console.log('❌ Task update failed:', updateTaskData.message);
    }
  } catch (error) {
    console.log('❌ Task update error:', error.message);
  }
}

// Test 8: Create Subtask
if (createdTaskId) {
  console.log('\n🧪 Testing Subtask Creation...');
  try {
    const createSubtaskResponse = await authenticatedRequest(`${BASE_URL}/tasks/${createdTaskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Subtask',
        description: 'This is a test subtask'
      })
    });
    
    const createSubtaskData = await createSubtaskResponse.json();
    
    if (createSubtaskResponse.ok) {
      console.log('✅ Subtask created successfully');
      console.log('   Subtask title:', createSubtaskData.data.title);
    } else {
      console.log('❌ Subtask creation failed:', createSubtaskData.message);
    }
  } catch (error) {
    console.log('❌ Subtask creation error:', error.message);
  }
}

// Test 9: Delete Task
if (createdTaskId) {
  console.log('\n🧪 Testing Task Deletion...');
  try {
    const deleteTaskResponse = await authenticatedRequest(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: 'DELETE'
    });
    
    const deleteTaskData = await deleteTaskResponse.json();
    
    if (deleteTaskResponse.ok) {
      console.log('✅ Task deleted successfully');
    } else {
      console.log('❌ Task deletion failed:', deleteTaskData.message);
    }
  } catch (error) {
    console.log('❌ Task deletion error:', error.message);
  }
}

console.log('\n🎉 API testing completed!');
console.log('\n📝 Note: Make sure your server is running on http://localhost:3000');
console.log('📝 Note: Make sure you have set up your .env file with DATABASE_URL and JWT_SECRET');
