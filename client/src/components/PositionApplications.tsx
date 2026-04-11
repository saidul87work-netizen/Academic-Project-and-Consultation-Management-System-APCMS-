import { useMemo, useState } from "react";
import { usePositions, type PositionFilterType } from "../hooks/usePositions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Briefcase, Clock, DollarSign, Calendar, CheckCircle2, XCircle, AlertCircle, Check, X } from "lucide-react";
import type { Position, Application } from "../services/positionApi";
import type { UserRole } from "../App";

interface PositionApplicationsProps {
  /** temporary stand-in for auth */
  studentId?: string;
  positions?: Position[];
  applications?: Application[];
  onApply?: (application: Omit<Application, "id" | "appliedDate" | "status">) => void;
  userRole?: UserRole;
  onUpdateApplication?: (id: string, status: "accepted" | "rejected", reason?: string) => void;
}

export function PositionApplications({
  studentId,
  positions: propPositions,
  applications: propApplications,
  onApply: propOnApply,
  userRole,
  onUpdateApplication
}: PositionApplicationsProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<PositionFilterType>("all");

  // Use the usePositions hook to manage data fetching
  const {
    positions: hookPositions,
    applications: hookApplications,
    submitApplication: hookSubmitApplication,
  } = usePositions({
    studentId: studentId,
    availableOnly: true
  });

  // Use props if provided, otherwise fall back to hook data
  const positions = propPositions || hookPositions;
  const applications = propApplications || hookApplications;
  const onApply = propOnApply || hookSubmitApplication;



  // For role-based logic, determine what user can see/do
  const canApply = userRole === "student";
  const canReviewApplications = userRole === "admin" || userRole === "faculty";



  // Helper functions
  const hasApplied = (positionId: string) => {
    return applications.some(app => app.positionId === positionId && app.studentId === studentId);
  };

  const submitApplication = async (applicationData: any) => {
    if (!onApply) throw new Error("Application submission not available");
    return onApply(applicationData);
  };
  
  // Form state
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [formStudentId, setFormStudentId] = useState("");
  const [gpa, setGpa] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  //this controls the badge color based on position type
  const getPositionTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "TA": return "default";
      case "RA": return "secondary";
      case "ST": return "outline";
      default: return "default";
    }
  };
  // Filtering positions (ST/RA/TA)
  const availablePositions = useMemo(() => {
    const filtered = filterType === "all" ? positions : positions.filter((p) => p.type === filterType);
    // backend already supports availableOnly=true, but keep safety net
    return filtered.filter((p) => p.filled < p.spots);
  }, [filterType, positions]);
 
  //Submit application, ekhane 3 ta jinish handle kortesi: form validation, check if already applied, and then call onApply prop
  const handleApply = async () => {
    if (!selectedPosition || !studentName || !email || !formStudentId || !gpa || !expertiseInput || !availability || !experience || !coverLetter) {
      alert("Please fill in all fields");
      return;
    }

    if (hasApplied(selectedPosition.id)) {
      alert("You have already applied for this position");
      return;
    }

    const expertise = expertiseInput.split(",").map((e) => e.trim()).filter((e) => e);

    try {
      await submitApplication({
        positionId: selectedPosition.id,
        studentName,
        email,
        studentId: formStudentId,
        gpa,
        expertise,
        availability,
        experience,
        coverLetter
      });

      // Reset form
      setStudentName("");
      setEmail("");
      setFormStudentId("");
      setGpa("");
      setExpertiseInput("");
      setAvailability("");
      setExperience("");
      setCoverLetter("");
      setIsDialogOpen(false);
      alert("Application submitted successfully!");
    } catch (e: any) {
      alert(e?.message ?? "Failed to submit application");
    }
  };

  const openApplicationDialog = (position: Position) => {
    setSelectedPosition(position);
    setIsDialogOpen(true);
  };

  const myApplications = applications;

  return (
    <Tabs defaultValue="browse" className="space-y-6">
      <TabsList>
        <TabsTrigger value="browse">Browse Positions</TabsTrigger>
        <TabsTrigger value="my-applications">My Applications ({myApplications.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="browse" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Position Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for Positions</CardTitle>
              <CardDescription>Fill out the application form to apply for available positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Full Name *</Label>
                  <Input
                    id="student-name"
                    placeholder="Rafsan Rahman"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Rafsan.Rahman@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID *</Label>
                  <Input
                    id="student-id"
                    placeholder="22201972"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA *</Label>
                  <Input
                    id="gpa"
                    placeholder="3.8"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise *</Label>
                <Input
                  id="expertise"
                  placeholder="Data Structures, Algorithms, Java, Python (comma-separated)"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                />
                <p className="text-gray-500 text-sm">Separate multiple areas with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability *</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Monday-Friday, 2-6 PM"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Relevant Experience *</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your relevant experience, coursework, or previous positions..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-letter">Cover Letter *</Label>
                <Textarea
                  id="cover-letter"
                  placeholder="Explain why you're interested in this position and what makes you a good fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Position Availability Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Position Availability</CardTitle>
              <CardDescription>Overview of available positions by type and department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "TA" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("TA")}
                >
                  TA
                </Button>
                <Button
                  variant={filterType === "RA" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("RA")}
                >
                  RA
                </Button>
                <Button
                  variant={filterType === "ST" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("ST")}
                >
                  ST
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {positions.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Loading positions...</p>
                )}
                {availablePositions.map((position) => {
                  const spotsLeft = position.spots - position.filled;
                  const isAvailable = spotsLeft > 0;
                  const hasUserApplied = hasApplied(position.id);

                  return (
                    <div key={position.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{position.title}</h4>
                            <Badge variant={getPositionTypeBadgeVariant(position.type)} className="text-xs">
                              {position.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{position.department}</p>
                          <p className="text-xs text-gray-500 truncate">{position.faculty}</p>
                        </div>
                        <div className="text-right ml-2">
                          <Badge
                            variant={isAvailable ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {isAvailable ? `${spotsLeft} spots` : "Full"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>{position.hoursPerWeek} hrs/week</span>
                          <span>{position.payRate}</span>
                        </div>
                        {canApply && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPosition(position);
                              setIsDialogOpen(true);
                            }}
                            disabled={!isAvailable || hasUserApplied}
                            className="text-xs h-7"
                          >
                            {hasUserApplied ? "Applied" : "Apply"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {availablePositions.length === 0 && positions.length > 0 && (
                  <p className="text-gray-500 text-center py-8">No positions available in this category</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Position Details Table - Two Bar Format */}
        <Card>
          <CardHeader>
            <CardTitle>All Position Details</CardTitle>
            <CardDescription>Complete overview of all positions in tabular format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Position</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Department</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Faculty</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700">Available</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Hours</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Pay Rate</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => {
                    const spotsLeft = position.spots - position.filled;
                    const isAvailable = spotsLeft > 0;
                    const hasUserApplied = hasApplied(position.id);

                    return (
                      <tr key={position.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{position.title}</p>
                            <p className="text-xs text-gray-600">{position.description.slice(0, 50)}...</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getPositionTypeBadgeVariant(position.type)} className="text-xs">
                            {position.type === "TA" && "Teaching Assistant"}
                            {position.type === "RA" && "Research Assistant"}
                            {position.type === "ST" && "Student Tutor"}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-700">{position.department}</td>
                        <td className="p-3 text-sm text-gray-700">{position.faculty}</td>
                        <td className="p-3 text-center">
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                            isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isAvailable ? `${spotsLeft}/${position.spots}` : 'Full'}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-700">{position.hoursPerWeek} hrs/week</td>
                        <td className="p-3 text-sm text-gray-700">{position.payRate}</td>
                        <td className="p-3 text-center">
                          {canApply && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPosition(position);
                                setIsDialogOpen(true);
                              }}
                              disabled={!isAvailable || hasUserApplied}
                              className="text-xs h-7"
                            >
                              {hasUserApplied ? "Applied" : "Apply"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {positions.length === 0 && (
              <p className="text-gray-500 text-center py-8">Loading positions...</p>
            )}
          </CardContent>
        </Card>

        {/* Application Dialog */}
        {canApply && selectedPosition && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Apply for {selectedPosition.title}</DialogTitle>
                <DialogDescription>
                  Complete your application for this position. All fields are required.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Position Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <Badge variant={getPositionTypeBadgeVariant(selectedPosition.type)} className="ml-2">
                        {selectedPosition.type}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="ml-2 text-gray-900">{selectedPosition.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hours:</span>
                      <span className="ml-2 text-gray-900">{selectedPosition.hoursPerWeek} hrs/week</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pay Rate:</span>
                      <span className="ml-2 text-gray-900">{selectedPosition.payRate}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleApply} className="w-full" size="lg">
                  Submit Application
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </TabsContent>

      <TabsContent value="my-applications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {canReviewApplications ? "Application Management" : "My Applications"}
            </CardTitle>
            <CardDescription>
              {canReviewApplications
                ? "Review and manage ST/RA/TA applications"
                : "Track the status of your submitted applications"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">You haven't submitted any applications yet</p>
            ) : (
              <div className="space-y-4">
                {myApplications.map((application) => {
                  const position = positions.find(p => p.id === application.positionId);
                  if (!position) return null;

                  return (
                    <Card key={application._id} className="border-2">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-gray-900">{position.title}</h3>
                                <Badge variant={getPositionTypeBadgeVariant(position.type)}>
                                  {position.type}
                                </Badge>
                              </div>
                              <p className="text-gray-600">{position.department}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant={
                                  application.status?.toLowerCase() === "accepted" ? "default" :
                                  application.status?.toLowerCase() === "rejected" ? "destructive" :
                                  "secondary"
                                }
                                className="flex items-center gap-1"
                              >
                                {application.status?.toLowerCase() === "accepted" && <CheckCircle2 className="size-3" />}
                                {application.status?.toLowerCase() === "rejected" && <XCircle className="size-3" />}
                                {application.status?.toLowerCase() === "pending" && <AlertCircle className="size-3" />}
                                {application.status?.charAt(0).toUpperCase() + application.status?.slice(1).toLowerCase()}
                              </Badge>

                              {canReviewApplications && application.status?.toLowerCase() === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => onUpdateApplication?.(application._id, "accepted")}
                                  >
                                    <Check className="size-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => onUpdateApplication?.(application._id, "rejected")}
                                  >
                                    <X className="size-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                            <div>
                              <p className="text-gray-500">Applied on</p>
                              <p>{new Date(application.appliedAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">GPA</p>
                              <p>{application.gpa}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-500 mb-1">Expertise</p>
                            <div className="flex flex-wrap gap-2">
                              {application.expertise?.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline">{skill}</Badge>
                              )) || []}
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-500 mb-1">Availability</p>
                            <p className="text-gray-700">{application.availability}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
