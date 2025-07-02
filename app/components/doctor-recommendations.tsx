
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star,
  Clock,
  CreditCard,
  Video,
  Route,
  Filter,
  Search,
  Stethoscope,
  Shield,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DoctorRecommendation, PatientProfile } from '@/lib/types';
import { toast } from 'sonner';

interface DoctorRecommendationsProps {
  patientProfile: PatientProfile;
}

export default function DoctorRecommendations({ patientProfile }: DoctorRecommendationsProps) {
  const [doctors, setDoctors] = useState<DoctorRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'matchScore' | 'distance' | 'rating'>('matchScore');
  const [filterBySpecialization, setFilterBySpecialization] = useState<string>('all');

  useEffect(() => {
    if (patientProfile.location?.zipCode) {
      findDoctors();
    }
  }, [patientProfile.location?.zipCode]);

  const findDoctors = async () => {
    if (!patientProfile.location?.zipCode) {
      toast.error('Please enter your zip code in the profile section first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/find-doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientCode: patientProfile.patientCode,
          zipCode: patientProfile.location.zipCode,
          preferredGender: patientProfile.location.preferredGender,
          experienceLevel: patientProfile.location.experienceLevel,
          specialization: patientProfile.location.specialization,
          maxDistance: patientProfile.location.maxDistance || 50,
          acceptsInsurance: true,
          offersTelemedicine: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find doctors');
      }

      const result = await response.json();
      if (result.success) {
        setDoctors(result.recommendations);
        toast.success(`Found ${result.recommendations.length} doctors matching your preferences`);
      } else {
        throw new Error(result.error || 'Failed to find doctors');
      }
    } catch (error) {
      console.error('Error finding doctors:', error);
      toast.error('Failed to find doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedDoctors = doctors
    .filter(doctor => {
      const matchesSearch = doctor.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialization = filterBySpecialization === 'all' || 
                                   doctor.specialization === filterBySpecialization;
      
      return matchesSearch && matchesSpecialization;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const getSpecializationColor = (specialization: string) => {
    const colors = {
      reproductive_endocrinology: 'bg-purple-100 text-purple-800',
      ivf_specialist: 'bg-blue-100 text-blue-800',
      gynecologist: 'bg-pink-100 text-pink-800',
      urologist: 'bg-orange-100 text-orange-800',
      fertility_counselor: 'bg-green-100 text-green-800'
    };
    return colors[specialization as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceColor = (experience: string) => {
    const colors = {
      junior: 'bg-yellow-100 text-yellow-800',
      experienced: 'bg-blue-100 text-blue-800',
      senior: 'bg-purple-100 text-purple-800'
    };
    return colors[experience as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatSpecialization = (specialization: string) => {
    return specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            <span>Doctor Recommendations</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Personalized fertility specialist recommendations based on your location and preferences
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search doctors or clinics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matchScore">Best Match</SelectItem>
                <SelectItem value="distance">Closest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBySpecialization} onValueChange={setFilterBySpecialization}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="reproductive_endocrinology">Reproductive Endocrinology</SelectItem>
                <SelectItem value="ivf_specialist">IVF Specialist</SelectItem>
                <SelectItem value="gynecologist">Gynecologist</SelectItem>
                <SelectItem value="urologist">Urologist</SelectItem>
                <SelectItem value="fertility_counselor">Fertility Counselor</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={findDoctors} disabled={loading} className="whitespace-nowrap">
              {loading ? 'Searching...' : 'Refresh Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p>Finding doctors in your area...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredAndSortedDoctors.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
            <p className="text-muted-foreground mb-4">
              {doctors.length === 0 
                ? 'Please ensure your zip code is entered in the profile section.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {doctors.length === 0 && (
              <Button onClick={findDoctors} disabled={!patientProfile.location?.zipCode}>
                Search for Doctors
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">
                            {doctor.doctorName}
                          </h3>
                          <p className="text-lg text-muted-foreground mb-2">
                            {doctor.clinicName}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={getSpecializationColor(doctor.specialization)}>
                              {formatSpecialization(doctor.specialization)}
                            </Badge>
                            <Badge className={getExperienceColor(doctor.experience)}>
                              {doctor.experience} experience
                            </Badge>
                            <Badge variant="outline">
                              {doctor.gender} doctor
                            </Badge>
                            {doctor.offersTelemedicine && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Video className="w-3 h-3 mr-1" />
                                Telemedicine
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {doctor.matchScore && (
                            <div className="mb-2">
                              <div className="text-2xl font-bold text-primary">
                                {Math.round(doctor.matchScore)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Match Score</div>
                            </div>
                          )}
                          
                          {doctor.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{doctor.rating}</span>
                              <span className="text-muted-foreground text-sm">
                                ({doctor.reviewCount})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {doctor.distance ? `${doctor.distance.toFixed(1)} km away` : 'Distance N/A'}
                            </p>
                            <p className="text-muted-foreground">{doctor.address}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Wait Time</p>
                            <p className="text-muted-foreground">{doctor.averageWaitTime}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Consultation Fee</p>
                            <p className="text-muted-foreground">₹{doctor.consultationFee?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {doctor.matchReason && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Why recommended:</strong> {doctor.matchReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 lg:min-w-[200px]">
                      {doctor.phoneNumber && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${doctor.phoneNumber}`} className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>Call</span>
                          </a>
                        </Button>
                      )}
                      
                      {doctor.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${doctor.email}`} className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                          </a>
                        </Button>
                      )}
                      
                      {doctor.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doctor.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Website</span>
                          </a>
                        </Button>
                      )}

                      {doctor.offersTelemedicine && (
                        <Button size="sm" className="flex items-center space-x-2">
                          <Video className="w-4 h-4" />
                          <span>Book Virtual</span>
                        </Button>
                      )}
                      
                      <Button size="sm" variant="default" className="flex items-center space-x-2">
                        <Route className="w-4 h-4" />
                        <span>Book Appointment</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
