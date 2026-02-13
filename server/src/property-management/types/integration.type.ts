// model MasterIntegrations {
//   id       String           @id @default(uuid())
//   type     IntegrationTypes @default(channel_manager)
//   name     String           @unique
//   isActive Boolean          @default(true)

//   createdAt                          DateTime                            @default(now()) @map("created_at")
//   propertyIntegrations               PropertyIntegrations[]
//   requiredFieldsForMasterIntegration RquiredFieldsForMasterIntegration[]
//   masterIntegrationURLFields         MasterIntegrationURLFields[]

//   @@map("master_integrations")
// }

// model RquiredFieldsForMasterIntegration {
//   id                  String @id @default(uuid())
//   name                String
//   masterIntegrationId String @map("master_integration_id")

//   MasterIntegration          MasterIntegrations           @relation(fields: [masterIntegrationId], references: [id], onDelete: Cascade)
//   propertyInregrationSecrets PropertyInregrationSecrets[]

//   @@index([masterIntegrationId])
//   @@map("required_fields_for_master_integration")
// }

// model MasterIntegrationURLFields {
//   id                  String @id @default(uuid())
//   name                String
//   url                 String
//   masterIntegrationId String @map("master_integration_id")

//   MasterIntegration MasterIntegrations @relation(fields: [masterIntegrationId], references: [id], onDelete: Cascade)

//   @@index([masterIntegrationId])
//   @@map("master_integration_url_fields")
// }

// model PropertyIntegrations {
//   id                         String                       @id @default(uuid())
//   propertyId                 String                       @map("property_id")
//   Property                   Property                     @relation(fields: [propertyId], references: [id], onDelete: Cascade)
//   masterIntegrationId        String                       @map("master_integration_id")
//   MasterIntegration          MasterIntegrations           @relation(fields: [masterIntegrationId], references: [id])
//   isActive                   Boolean                      @map("is_active")
//   propertyIntegrationSecrets PropertyInregrationSecrets[]

//   createdAt DateTime @default(now()) @map("created_at")

//   @@unique([propertyId, masterIntegrationId])
//   @@index([propertyId])
//   @@index([masterIntegrationId])
//   @@map("property_integrations")
// }

// model PropertyInregrationSecrets {
//   id                    String                            @id @default(uuid())
//   propertyIntegrationId String                            @map("property_integration_id")
//   requiredFieldId       String                            @map("required_field_id")
//   value                 String
//   PropertyIntegration   PropertyIntegrations              @relation(fields: [propertyIntegrationId], references: [id], onDelete: Cascade)
//   RequiredField         RquiredFieldsForMasterIntegration @relation(fields: [requiredFieldId], references: [id], onDelete: Cascade)

//   createdAt DateTime @default(now()) @map("created_at")

//   @@unique([propertyIntegrationId, requiredFieldId])
//   @@index([propertyIntegrationId])
//   @@index([requiredFieldId])
//   @@map("property_integration_secrets")
// }
