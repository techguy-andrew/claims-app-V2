import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Types matching the ClaimData structure
interface ClaimPDFProps {
  claim: {
    claimNumber: string
    insuranceCompany: string | null
    adjustor: string | null
    clientPhone: string | null
    clientAddress: string | null
    claimant: {
      name: string | null
      email: string
    }
    items: Array<{
      title: string
      description: string | null
    }>
  }
}

// PDF styles matching web app design system - compact layout
const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // slate-200
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#020617', // foreground (dark blue-black)
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b', // slate-500 (muted-foreground)
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#64748b', // slate-500 (muted-foreground)
  },
  fieldGroup: {
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 8,
    color: '#64748b', // slate-500 (muted-foreground)
    marginBottom: 2,
    fontWeight: 'medium',
  },
  fieldValue: {
    fontSize: 10,
    color: '#020617', // foreground (dark blue-black)
    fontWeight: 'semibold',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  itemsSection: {
    marginTop: 0,
  },
  itemCard: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200 (border)
    break: 'avoid', // Prevent page breaks inside item cards
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#020617', // foreground
  },
  itemDescription: {
    fontSize: 9,
    color: '#475569', // slate-600
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 16,
    fontSize: 8,
    color: '#94a3b8', // slate-400
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0', // slate-200
    paddingTop: 8,
  },
})

export function ClaimPDF({ claim }: ClaimPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{claim.claimNumber}</Text>
          <Text style={styles.subtitle}>Claim Details</Text>
        </View>

        {/* Consolidated Claim & Client Information */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Insurance Company</Text>
                <Text style={styles.fieldValue}>
                  {claim.insuranceCompany || 'N/A'}
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Adjustor</Text>
                <Text style={styles.fieldValue}>
                  {claim.adjustor || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.column}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Client Name</Text>
                <Text style={styles.fieldValue}>
                  {claim.claimant.name || 'N/A'}
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValue}>
                  {claim.claimant.email}
                </Text>
              </View>
            </View>

            <View style={styles.column}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <Text style={styles.fieldValue}>
                  {claim.clientPhone || 'N/A'}
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Address</Text>
                <Text style={styles.fieldValue}>
                  {claim.clientAddress || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Claim Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claim Items ({claim.items.length})</Text>

          <View style={styles.itemsSection}>
            {claim.items.map((item, index) => (
              <View key={index} style={styles.itemCard} wrap={false}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>
                  {item.description || 'No description provided'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  )
}
