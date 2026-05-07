import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  QrCode, Bike, CheckCircle2, Clock, Calendar,
  MapPin, Download, Share2, Trophy, User, Mail, Phone
} from 'lucide-react'
import './CorredorPage.css'

const MOCK_CORREDOR = {
  nombre: 'Juan Pérez López',
  email: 'juan.perez@mail.com',
  telefono: '+52 555 123 4567',
  numero: '#0042',
  carrera: '100 Kilómetros — Élite',
  categoria: 'Adultos',
  estado: 'validado',
  fechaRegistro: '2026-04-20',
  fechaValidacion: '2026-04-21',
  fechaEvento: '15 de Junio, 2026',
  ubicacion: 'Parque Central',
  horasalida: '6:00 AM',
}

export default function CorredorPage() {
  const [corredor] = useState(MOCK_CORREDOR)

  return (
    <div className="corredor-page" id="corredor-page">
      <div className="corredor-page__bg">
        <div className="corredor-page__orb" />
      </div>
      <div className="container">
        <div className="corredor-layout">

          {/* Left: QR Card */}
          <div className="corredor-qr-section">
            <div className="corredor-qr-card glass">
              <div className="corredor-qr-card__badge">
                <CheckCircle2 size={14} /> Validado
              </div>
              <div className="corredor-qr-card__qr">
                <QrCode size={120} />
              </div>
              <div className="corredor-qr-card__number">{corredor.numero}</div>
              <div className="corredor-qr-card__name">{corredor.nombre}</div>
              <div className="corredor-qr-card__race">{corredor.carrera}</div>
              <div className="corredor-qr-card__actions">
                <button className="btn btn-primary btn-sm" id="download-qr">
                  <Download size={16} /> Descargar QR
                </button>
                <button className="btn btn-secondary btn-sm" id="share-qr">
                  <Share2 size={16} /> Compartir
                </button>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="corredor-info-section">
            <h1 className="corredor-info__title">Panel del Corredor</h1>
            <p className="corredor-info__sub">Tu información de inscripción y datos del evento</p>

            {/* Status timeline */}
            <div className="corredor-timeline glass">
              <div className="corredor-timeline__step corredor-timeline__step--done">
                <div className="corredor-timeline__dot"><CheckCircle2 size={16} /></div>
                <div>
                  <div className="corredor-timeline__label">Registro completado</div>
                  <div className="corredor-timeline__date">{corredor.fechaRegistro}</div>
                </div>
              </div>
              <div className="corredor-timeline__line corredor-timeline__line--done" />
              <div className="corredor-timeline__step corredor-timeline__step--done">
                <div className="corredor-timeline__dot"><CheckCircle2 size={16} /></div>
                <div>
                  <div className="corredor-timeline__label">Pago validado</div>
                  <div className="corredor-timeline__date">{corredor.fechaValidacion}</div>
                </div>
              </div>
              <div className="corredor-timeline__line corredor-timeline__line--done" />
              <div className="corredor-timeline__step corredor-timeline__step--done">
                <div className="corredor-timeline__dot"><CheckCircle2 size={16} /></div>
                <div>
                  <div className="corredor-timeline__label">Número asignado: {corredor.numero}</div>
                  <div className="corredor-timeline__date">{corredor.fechaValidacion}</div>
                </div>
              </div>
              <div className="corredor-timeline__line" />
              <div className="corredor-timeline__step">
                <div className="corredor-timeline__dot"><Clock size={16} /></div>
                <div>
                  <div className="corredor-timeline__label">Día de la carrera</div>
                  <div className="corredor-timeline__date">{corredor.fechaEvento}</div>
                </div>
              </div>
            </div>

            {/* Personal data */}
            <div className="corredor-data glass">
              <h3>Datos Personales</h3>
              <div className="corredor-data__grid">
                <div className="corredor-data__item">
                  <User size={16} />
                  <div><span>Nombre</span><p>{corredor.nombre}</p></div>
                </div>
                <div className="corredor-data__item">
                  <Mail size={16} />
                  <div><span>Email</span><p>{corredor.email}</p></div>
                </div>
                <div className="corredor-data__item">
                  <Phone size={16} />
                  <div><span>Teléfono</span><p>{corredor.telefono}</p></div>
                </div>
                <div className="corredor-data__item">
                  <Trophy size={16} />
                  <div><span>Categoría</span><p>{corredor.carrera}</p></div>
                </div>
              </div>
            </div>

            {/* Event info */}
            <div className="corredor-event glass">
              <h3>Información del Evento</h3>
              <div className="corredor-event__grid">
                <div className="corredor-event__item">
                  <Calendar size={20} />
                  <div>
                    <span>Fecha</span>
                    <p>{corredor.fechaEvento}</p>
                  </div>
                </div>
                <div className="corredor-event__item">
                  <MapPin size={20} />
                  <div>
                    <span>Ubicación</span>
                    <p>{corredor.ubicacion}</p>
                  </div>
                </div>
                <div className="corredor-event__item">
                  <Clock size={20} />
                  <div>
                    <span>Hora de Salida</span>
                    <p>{corredor.horasalida}</p>
                  </div>
                </div>
                <div className="corredor-event__item">
                  <Bike size={20} />
                  <div>
                    <span>Presenta tu QR</span>
                    <p>En el punto de registro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
