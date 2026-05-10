import { useEffect, useState } from 'react'
import './App.css'

const PLANTS_URL = 'http://localhost:6001/plants'

function App() {
  const [plants, setPlants] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ name: '', image: '', price: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(PLANTS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to fetch plants')
        }
        return response.json()
      })
      .then((data) => {
        setPlants(data.map((plant) => ({ ...plant, isOutOfStock: false })))
      })
      .catch(() => {
        setError('Unable to load plants. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleAddPlant = (event) => {
    event.preventDefault()
    const newPlant = {
      name: formData.name.trim(),
      image: formData.image.trim(),
      price: parseFloat(formData.price) || 0,
    }

    if (!newPlant.name || !newPlant.image) {
      setError('Please provide a plant name and image URL.')
      return
    }

    fetch(PLANTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPlant),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to add plant')
        }
        return response.json()
      })
      .then((createdPlant) => {
        setPlants((prevPlants) => [
          ...prevPlants,
          { ...createdPlant, isOutOfStock: false },
        ])
        setFormData({ name: '', image: '', price: '' })
        setError(null)
      })
      .catch(() => {
        setError('Unable to add plant. Please try again.')
      })
  }

  const handleMarkOutOfStock = (plantId) => {
    setPlants((prevPlants) =>
      prevPlants.map((plant) =>
        plant.id === plantId ? { ...plant, isOutOfStock: true } : plant,
      ),
    )
  }

  const visiblePlants = plants.filter((plant) =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Plant Shop</h1>
        <p>Browse plants, add new items, and mark items out of stock.</p>
      </header>

      <section className="controls">
        <div className="search-field">
          <label htmlFor="search">Search plants</label>
          <input
            id="search"
            name="search"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by plant name"
          />
        </div>
      </section>

      <section className="form-panel">
        <h2>Add a new plant</h2>
        <form onSubmit={handleAddPlant} className="plant-form">
          <div className="form-row">
            <label htmlFor="name">Plant name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Monstera"
            />
          </div>
          <div className="form-row">
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/plant.png"
            />
          </div>
          <div className="form-row">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
          <button type="submit" className="primary-button">
            Add Plant
          </button>
        </form>
        {error ? <p className="error-message">{error}</p> : null}
      </section>

      <section className="plants-panel">
        <h2>Plant Inventory</h2>
        {loading ? (
          <p>Loading plants...</p>
        ) : visiblePlants.length > 0 ? (
          <ul className="plant-list">
            {visiblePlants.map((plant) => (
              <li key={plant.id} className="plant-card">
                <img
                  src={plant.image}
                  alt={plant.name}
                  className="plant-image"
                />
                <div className="plant-copy">
                  <h3>{plant.name}</h3>
                  <p className="plant-price">${Number(plant.price).toFixed(2)}</p>
                  <button
                    type="button"
                    className="stock-button"
                    onClick={() => handleMarkOutOfStock(plant.id)}
                    disabled={plant.isOutOfStock}
                  >
                    {plant.isOutOfStock ? 'Out of Stock' : 'Mark as Out of Stock'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No plants match your search.</p>
        )}
      </section>
    </div>
  )
}

export default App
