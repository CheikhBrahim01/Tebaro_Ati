from donations.blockchain import record_donation_on_chain

# Remplacez par une adresse de test (votre adresse Ganache par exemple)
donor_address = "0x04957a632d34f6f0c79fec79d32fcac3263fe6229e830af822166753e0d63f08"
amount = 100  # Exemple : 100 (unités selon ce que vous avez défini)

txn_hash = record_donation_on_chain(donor_address, amount)
print("Transaction Hash:", txn_hash)
