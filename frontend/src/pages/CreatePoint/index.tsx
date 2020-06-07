import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios'

import api from '../../services/api'

import { FiArrowLeft } from 'react-icons/fi'

import logo from '../../assets/logo.svg'

import './styles.css'

interface Item {
  id: number
  title: string
  image_url: string
}

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  nome: string
}

const CreatePoint = () => {
  // Constants
  const history = useHistory()

  // States
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    name: '',
  })

  // Effects
  useEffect(() => {
    api.get('/items')
      .then((res) => setItems(res.data))
      .catch()
  }, [])

  useEffect(()=> {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then((res) => {
        const ufsInitials  = res.data.map(item => item.sigla)
        setUfs(ufsInitials)
      })
  }, [])

  useEffect(() => {
    if (selectedUf === '0') return
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then((res) => {
        const citiesName = res.data.map(city => city.nome)
        setCities(citiesName)
      })
  }, [selectedUf])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords
      setInitialPosition([latitude, longitude])
    })
  }, [])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value)
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  function handleSelectItem(id: number) {
    if (selectedItems.includes(id)) {
      const newSelectedItems = selectedItems.filter(item => item !== id)
      setSelectedItems(newSelectedItems)
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const {name, email, whatsapp} = formData
    const [latitude, longitude] = selectedPosition

    const data = {
      name,
      email,
      whatsapp,
      items: selectedItems,
      uf: selectedUf,
      city: selectedCity,
      latitude,
      longitude,
    }

    api.post('/points', data).then(
      () => {
        alert('Ponto criado')
        history.push("/")
      }
    ).catch(
      () => alert('Erro')
    )
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="logo-ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input onChange={handleInputChange} type="text" name="name" id="name"/>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input onChange={handleInputChange} type="email" name="email" id="email"/>
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input onChange={handleInputChange} type="text" name="whatsapp" id="whatsapp"/>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={16} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                value={selectedUf}
                onChange={handleSelectUf}
                name="uf"
                id="uf"
              >
                <option value="0">Selecione uma UF</option>
                { ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                )) }
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Selecione uma Cidade</label>
              <select value={selectedCity} onChange={handleSelectCity} name="city" id="city">
                <option value="0">Selecione uma Cidade</option>
                { cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                )) }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais items abaixo</span>
          </legend>

          <ul className="items-grid">
            { items.map(item =>
                <li
                  key={String(item.id)}
                  onClick={() => handleSelectItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt={item.title}/>
                  <span>{item.title}</span>
                </li>
            ) }
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint
